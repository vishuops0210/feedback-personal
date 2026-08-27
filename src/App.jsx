import React, { useState, useEffect, useRef } from 'react';
import './styles/main.css';
import { quarterlyReports, monthlyReports, feedbackFormConfig } from './data/reportData';
import {
  Sun,
  Moon,
  Printer,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Calendar,
  LayoutGrid,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
  MessageSquareHeart,
  Send,
  CheckCircle2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  User,
  ArrowUp,
  Eye,
  EyeOff,
  Star
} from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState('light');
  const [viewMode, setViewMode] = useState('quarterly'); // 'quarterly' | 'monthly'
  const [activeQuarter, setActiveQuarter] = useState('Q1');
  const [activeMonthId, setActiveMonthId] = useState('june-2026');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Feedback Modal State - Quarter starts empty/unselected so user MUST select one!
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedQuarterForFeedback, setSelectedQuarterForFeedback] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // WYSIWYG ContentEditable Reference & Formatting Active Toggle States
  const editorRef = useRef(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isUl, setIsUl] = useState(false);
  const [isOl, setIsOl] = useState(false);

  // Auto-open feedback modal if URL contains ?feedback=true, ?feedback=Q1, or #feedback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const feedbackParam = urlParams.get('feedback');
    const hash = window.location.hash;

    if (feedbackParam !== null || hash === '#feedback' || hash === '#share-feedback') {
      setFeedbackModalOpen(true);
      if (feedbackParam && ['Q1', 'Q2', 'Q3', 'Q4'].includes(feedbackParam.toUpperCase())) {
        setSelectedQuarterForFeedback(feedbackParam.toUpperCase());
        setActiveQuarter(feedbackParam.toUpperCase());
      }
    }
  }, []);

  // Clear modal text input when modal opens
  useEffect(() => {
    if (feedbackModalOpen) {
      setFeedbackText('');
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
  }, [feedbackModalOpen]);

  // Dynamic Expressive Emoji Rating State initialized from feedbackFormConfig
  const [ratings, setRatings] = useState(() => {
    const initialObj = {};
    (feedbackFormConfig.ratingCriteria || []).forEach(item => {
      initialObj[item.key] = 0;
    });
    return initialObj;
  });

  // Free Web3Forms access key for automatic background email delivery on GitHub Pages!
  const WEB3FORMS_ACCESS_KEY = "7961ca29-bdc2-4c35-bcdf-ba4f5121d125";

  // Cards closed by default
  const [openSections, setOpenSections] = useState({
    '01': false,
    '02': false,
    '03': false,
    '04': false,
    '05': false,
    '06': false,
    '07': false,
    '08': false
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleSection = (id) => {
    setOpenSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleAllSections = () => {
    const anyClosed = Object.values(openSections).some(v => !v);
    const newState = {};
    Object.keys(openSections).forEach(key => {
      newState[key] = anyClosed;
    });
    setOpenSections(newState);
  };

  const handlePrint = () => {
    if (viewMode === 'quarterly' && activeQuarter === 'Q1') {
      setOpenSections({
        '01': true,
        '02': true,
        '03': true,
        '04': true,
        '05': true,
        '06': true,
        '07': true,
        '08': true
      });
    }
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleStarClick = (key, starIndex) => {
    setRatings(prev => {
      const current = prev[key] || 0;
      const halfVal = starIndex - 0.5;
      const fullVal = starIndex;

      if (current === halfVal) {
        return { ...prev, [key]: fullVal };
      } else if (current === fullVal) {
        return { ...prev, [key]: 0 };
      } else {
        return { ...prev, [key]: halfVal };
      }
    });
  };


  const dismissKeyboard = () => {
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
  };

  const getEmojiForScore = (val) => {
    if (!val || val === 0) return '😶';
    if (val <= 1.5) return '😭';
    if (val <= 2.5) return '🥺';
    if (val <= 3.5) return '🙂';
    if (val <= 4.5) return '😊';
    return '🌸';
  };

  // Check which formatting states (B, I, U, etc.) are active at the current cursor position
  const updateToolbarState = () => {
    try {
      setIsBold(document.queryCommandState('bold'));
      setIsItalic(document.queryCommandState('italic'));
      setIsUnderline(document.queryCommandState('underline'));
      setIsUl(document.queryCommandState('insertUnorderedList'));
      setIsOl(document.queryCommandState('insertOrderedList'));
    } catch (e) {}
  };

  // Execute Native WYSIWYG Formatting Command (Bold, Italic, Underline, Lists)
  const execFormat = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      updateToolbarState();
      handleEditorInput();
    }
  };

  // Sync plain text content, strip browser-injected trailing linebreaks, & enforce 10,000 char max limit
  const handleEditorInput = () => {
    if (editorRef.current) {
      const rawContent = editorRef.current.innerText || editorRef.current.textContent || '';
      // Strip trailing browser-injected \n or zero-width spaces when empty
      const cleanText = rawContent.replace(/^[\r\n\s\u200B]+|[\r\n\s\u200B]+$/g, '');
      
      if (!rawContent.trim() || cleanText.length === 0) {
        setFeedbackText('');
      } else {
        if (cleanText.length > 10000) {
          document.execCommand('undo', false, null);
        } else {
          setFeedbackText(cleanText);
        }
      }
      updateToolbarState();
    }
  };

  // Convert HTML elements into native Unicode Bold, Italic & Underline characters so email clients render TRUE styling without raw <b> tags!
  const convertHTMLToUnicodeText = (html) => {
    if (!html) return '';

    const temp = document.createElement('div');
    temp.innerHTML = html;

    const toUnicodeChar = (char, isBold, isItalic) => {
      const code = char.charCodeAt(0);
      
      // Upper case A-Z
      if (code >= 65 && code <= 90) {
        const offset = code - 65;
        if (isBold && isItalic) return String.fromCodePoint(0x1D63C + offset); // Bold Italic Sans-Serif
        if (isBold) return String.fromCodePoint(0x1D5A0 + offset); // Bold Sans-Serif
        if (isItalic) return String.fromCodePoint(0x1D608 + offset); // Italic Sans-Serif
      }
      
      // Lower case a-z
      if (code >= 97 && code <= 122) {
        const offset = code - 97;
        if (isBold && isItalic) return String.fromCodePoint(0x1D656 + offset); // Bold Italic Sans-Serif
        if (isBold) return String.fromCodePoint(0x1D5BA + offset); // Bold Sans-Serif
        if (isItalic) return String.fromCodePoint(0x1D622 + offset); // Italic Sans-Serif
      }

      // Digits 0-9
      if (code >= 48 && code <= 57 && isBold) {
        return String.fromCodePoint(0x1D7EC + (code - 48));
      }

      return char;
    };

    const processNode = (node, isBold = false, isItalic = false, isUnderline = false) => {
      let result = '';

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        for (let i = 0; i < text.length; i++) {
          let ch = text[i];
          if (isBold || isItalic) {
            ch = toUnicodeChar(ch, isBold, isItalic);
          }
          if (isUnderline && ch !== '\n' && ch !== '\r' && ch !== ' ') {
            ch = ch + '\u0332'; // Combining Underline character
          }
          result += ch;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();
        let childIsBold = isBold || tag === 'b' || tag === 'strong';
        let childIsItalic = isItalic || tag === 'i' || tag === 'em';
        let childIsUnderline = isUnderline || tag === 'u';

        if (tag === 'br') {
          result += '\n';
        } else if (tag === 'li') {
          result += '\n• ';
        } else if (tag === 'p' || tag === 'div') {
          result += '\n';
        }

        for (let child of node.childNodes) {
          result += processNode(child, childIsBold, childIsItalic, childIsUnderline);
        }

        if (tag === 'p' || tag === 'div' || tag === 'ul' || tag === 'ol') {
          result += '\n';
        }
      }

      return result;
    };

    const output = processNode(temp);
    return output.replace(/\n{3,}/g, '\n\n').trim();
  };

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const getMoodLabel = (val) => {
      if (!val) return 'Not Rated';
      const baseVal = Math.ceil(val);
      const match = (feedbackFormConfig.emojiMoods || []).find(m => m.value === baseVal);
      const emoji = match ? match.emoji : '⭐';
      return `${emoji} ${val} / 5.0`;
    };

    const ratingsSummary = (feedbackFormConfig.ratingCriteria || [])
      .map(item => `${item.label}: ${getMoodLabel(ratings[item.key])}`)
      .join('\n');

    const formattedUnicodeFeedback = editorRef.current 
      ? convertHTMLToUnicodeText(editorRef.current.innerHTML) 
      : feedbackText;

    const fullMessage = `Reviewer Name: ${reviewerName || 'Anonymous'}\nTarget Quarter: ${selectedQuarterForFeedback}\n\nGranular Evaluation Parameters:\n${ratingsSummary}\n\nAdditional Feedback:\n${formattedUnicodeFeedback || 'No extra written comments provided.'}`;

    // Send via Web3Forms API
    if (WEB3FORMS_ACCESS_KEY) {
      try {
        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: `Reviewer Feedback from ${reviewerName || 'Anonymous'} (${selectedQuarterForFeedback})`,
            from_name: reviewerName || "Report Reviewer",
            message: fullMessage,
            email: "reviewer@report.com"
          })
        });
        setFeedbackSubmitted(true);
      } catch (err) {
        console.error("Form submission error:", err);
      }
    } else {
      // Default Fallback
      const subject = encodeURIComponent(`Performance Report Feedback from ${reviewerName || 'Anonymous'} (${selectedQuarterForFeedback})`);
      const body = encodeURIComponent(fullMessage);
      window.open(`mailto:vishal@opstree.com?subject=${subject}&body=${body}`, '_blank');
      setFeedbackSubmitted(true);
    }

    setIsSubmitting(false);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setFeedbackText('');
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
      setReviewerName('');
      setSelectedQuarterForFeedback('');
      const resetObj = {};
      (feedbackFormConfig.ratingCriteria || []).forEach(item => {
        resetObj[item.key] = 0;
      });
      setRatings(resetObj);
      setFeedbackModalOpen(false);
    }, 2500);
  };

  const currentQuarterData = quarterlyReports[activeQuarter] || quarterlyReports['Q1'];
  const currentMonthIndex = monthlyReports.findIndex(m => m.id === activeMonthId);
  const currentMonthData = monthlyReports[currentMonthIndex] || monthlyReports[0];
  const currentSlide = currentMonthData.slides[activeSlideIndex] || currentMonthData.slides[0];

  const handlePrevMonth = () => {
    if (currentMonthIndex > 0) {
      setActiveMonthId(monthlyReports[currentMonthIndex - 1].id);
      setActiveSlideIndex(0);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex < monthlyReports.length - 1) {
      setActiveMonthId(monthlyReports[currentMonthIndex + 1].id);
      setActiveSlideIndex(0);
    }
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    const tokens = text.split(/(\[[^\]]+\]\([^)]+\)|\{.*?\}|`.*?`|\[[a-z]+:.*?\]|\*\*.*?\*\*|\*.*?\*)/g);

    return tokens.map((token, i) => {
      if (!token) return null;

      // 1. Standard Markdown Link: [Link Title](https://...)
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, linkText, linkUrl] = linkMatch;
        return (
          <a
            key={i}
            href={linkUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-link-button"
          >
            <span>{linkText}</span>
            <ExternalLink size={12} />
          </a>
        );
      }

      // 2. Tech Code Pill Tag: {Text} or `Text`
      if ((token.startsWith('{') && token.endsWith('}')) || (token.startsWith('`') && token.endsWith('`'))) {
        return <span key={i} className="tech-tag">{token.slice(1, -1)}</span>;
      }

      // 3. Color Shaded Highlight Tag: [blue:Text], [green:Text], [purple:Text], [orange:Text], [red:Text]
      if (token.startsWith('[') && token.endsWith(']') && token.includes(':')) {
        const inner = token.slice(1, -1);
        const colonIdx = inner.indexOf(':');
        if (colonIdx !== -1) {
          const color = inner.slice(0, colonIdx).toLowerCase();
          const label = inner.slice(colonIdx + 1);
          return <span key={i} className={`highlight-tag highlight-${color}`}>{label}</span>;
        }
      }

      // 4. Bold Text: **Text**
      if (token.startsWith('**') && token.endsWith('**')) {
        return <strong key={i}>{token.slice(2, -2)}</strong>;
      }

      // 5. Italic Text: *Text*
      if (token.startsWith('*') && token.endsWith('*')) {
        return <em key={i}>{token.slice(1, -1)}</em>;
      }

      return token;
    });
  };

  const quarters = [
    { id: 'Q1', title: 'Q1', months: 'June, July & Aug' },
    { id: 'Q2', title: 'Q2', months: 'Sep, Oct & Nov' },
    { id: 'Q3', title: 'Q3', months: 'Dec, Jan & Feb' },
    { id: 'Q4', title: 'Q4', months: 'Mar, Apr & May' },
  ];

  const anyClosed = Object.values(openSections).some(v => !v);

  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
  const [navHeight, setNavHeight] = useState(77);

  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);
      setShowScrollTop(scrollY > 220);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!navRef.current) return;
    const updateNavHeight = () => {
      if (navRef.current) {
        setNavHeight(navRef.current.offsetHeight);
      }
    };
    updateNavHeight();
    const observer = new ResizeObserver(updateNavHeight);
    observer.observe(navRef.current);
    return () => observer.disconnect();
  }, [scrolled, isHeaderCollapsed, viewMode]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleHeaderCollapse = () => {
    setIsHeaderCollapsed(prev => !prev);
  };

  return (
    <div className={`report-app ${isHeaderCollapsed ? 'header-is-collapsed' : ''}`}>
      {/* Alive Google-Style Ambient Background Orbs */}
      <div className="ambient-bg-container" aria-hidden="true">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
      </div>

      {/* Floating Scroll To Top Button */}
      {showScrollTop && (
        <button className="btn-scroll-top" onClick={scrollToTop} title="Scroll to Top">
          <ArrowUp size={18} />
        </button>
      )}

      {/* Top Navbar */}
      <nav ref={navRef} className={`top-navbar ${scrolled ? 'scrolled' : ''} ${isHeaderCollapsed ? 'is-collapsed' : ''}`}>
        {isHeaderCollapsed ? (
          <div className="mini-nav-container">
            <div className="mini-brand-title">Quarterly Report ({activeQuarter})</div>
            <div className="mini-nav-actions">
              {viewMode === 'quarterly' && currentQuarterData.sections.length > 0 && (
                <button className="btn-action-icon" onClick={toggleAllSections} title="Expand / Collapse All Cards">
                  <ChevronsUpDown size={14} />
                </button>
              )}
              <button className="btn-action-icon" onClick={toggleTheme} title="Toggle Theme">
                {theme === 'light' ? <Sun size={14} color="#eab308" /> : <Moon size={14} color="#38bdf8" />}
              </button>
              <button className="btn-action-icon" onClick={handlePrint} title="Print or Export PDF">
                <Printer size={14} />
              </button>
              <button
                className="btn-restore-nav"
                onClick={() => setIsHeaderCollapsed(false)}
                title="Show Full Navigation Controls"
              >
                <Eye size={14} />
                <span>Show Nav</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="nav-container">
            <div>
              <div className="brand-title">Quarterly Performance Report</div>
              <div className="brand-period">
                {viewMode === 'quarterly' ? `Quarterly View (${activeQuarter})` : `Monthly Slides (${currentMonthData.month})`}
              </div>
            </div>

            {/* View Mode Switcher: Quarterly vs Monthly */}
            <div className="view-switcher-bar">
              <button
                className={`view-btn ${viewMode === 'quarterly' ? 'active' : ''}`}
                onClick={() => setViewMode('quarterly')}
              >
                <LayoutGrid size={14} />
                <span>Quarterly</span>
              </button>
              <button
                className={`view-btn ${viewMode === 'monthly' ? 'active' : ''}`}
                onClick={() => setViewMode('monthly')}
              >
                <ImageIcon size={14} />
                <span>Monthly Slides</span>
              </button>
            </div>

            <div className="nav-actions">
              {/* Eye-Catching Animated Moving Gradient Feedback Button */}
              <button
                className="btn-feedback-gradient"
                onClick={() => setFeedbackModalOpen(true)}
                title="Share Your Feedback"
              >
                <Sparkles size={14} />
                <span>Share Feedback</span>
              </button>

              {viewMode === 'quarterly' && currentQuarterData.sections.length > 0 && (
                <button className="btn-action" onClick={toggleAllSections} title="Expand / Collapse All Cards">
                  <ChevronsUpDown size={14} />
                  <span className="btn-text">{anyClosed ? 'Expand All' : 'Collapse All'}</span>
                </button>
              )}
              <button className="btn-action" onClick={toggleTheme} title="Toggle Theme">
                {theme === 'light' ? <Sun size={14} color="#eab308" /> : <Moon size={14} color="#38bdf8" />}
                <span className="btn-text">{theme === 'light' ? 'Light' : 'Dark'}</span>
              </button>
              <button className="btn-action" onClick={handlePrint} title="Print or Export PDF">
                <Printer size={14} />
                <span className="btn-text">Print</span>
              </button>

              {/* Hide Header Button */}
              <button
                className="btn-action"
                onClick={toggleHeaderCollapse}
                title="Hide Full Header for Reading Area"
              >
                <EyeOff size={14} />
                <span className="btn-text">Hide</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Document Content */}
      <div className="main-wrapper" style={{ '--nav-h': `${navHeight}px` }}>
        {viewMode === 'quarterly' ? (
          <>
            {/* Quarter Selection Tabs */}
            <div className={`quarter-selector-bar ${isHeaderCollapsed ? 'is-collapsed' : ''}`}>
              {quarters.map(q => (
                <button
                  key={q.id}
                  className={`quarter-tab ${activeQuarter === q.id ? 'active' : ''}`}
                  onClick={() => setActiveQuarter(q.id)}
                >
                  <span>{q.title}</span>
                  <span className="tab-months">{q.months}</span>
                </button>
              ))}
            </div>

            {/* Formal Print-Only Title Header */}
            <div className="print-only-header">
              <h1>Quarterly Performance & Deliverables Report ({activeQuarter})</h1>
              <p>Reporting Period: {currentQuarterData.period} • Prepared by Vishal</p>
            </div>

            {/* Detailed Content from quarterlyReports data */}
            {currentQuarterData.sections && currentQuarterData.sections.length > 0 ? (
              currentQuarterData.sections.map(section => {
                const isOpen = openSections[section.id];
                return (
                  <div key={section.id} className={`accordion-card ${isOpen ? 'open' : ''}`}>
                    <button className="card-toggle-header" onClick={() => toggleSection(section.id)}>
                      <div className="header-left">
                        <span className="section-title">{section.title}</span>
                      </div>
                      <div className="header-right">
                        <span className="badge-count">{section.badge}</span>
                        <ChevronDown size={18} className="chevron-icon" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="card-content-body">
                        {section.type === 'bullets' && (
                          <ul className="bullet-list">
                            {section.bullets.map((b, idx) => (
                              <li key={idx} className="bullet-item">
                                {b.type === 'group' ? (
                                  <>
                                    {renderFormattedText(b.main)}
                                    <div className="sub-group">
                                      {b.items.map((subItem, sIdx) => (
                                        <div key={sIdx} className="sub-item">
                                          {renderFormattedText(subItem)}
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                ) : (
                                  renderFormattedText(b.text)
                                )}
                              </li>
                            ))}
                          </ul>
                        )}

                        {section.type === 'subsections' && (
                          section.subSections.map((subSec, subIdx) => (
                            <React.Fragment key={subIdx}>
                              <div className="sub-section-title">{subSec.title}</div>
                              <ul className="bullet-list">
                                {subSec.bullets.map((b, idx) => (
                                  <li key={idx} className="bullet-item">
                                    {b.type === 'group' ? (
                                      <>
                                        {renderFormattedText(b.main)}
                                        <div className="sub-group">
                                          {b.items.map((subItem, sIdx) => (
                                            <div key={sIdx} className="sub-item">
                                              {renderFormattedText(subItem)}
                                            </div>
                                          ))}
                                        </div>
                                      </>
                                    ) : b.type === 'link' ? (
                                      <>
                                        {renderFormattedText(b.text)}
                                        <div>
                                          <a
                                            href={b.linkUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="link-button"
                                          >
                                            {b.linkText} <ExternalLink size={13} />
                                          </a>
                                        </div>
                                      </>
                                    ) : (
                                      renderFormattedText(b.text)
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </React.Fragment>
                          ))
                        )}

                        {section.type === 'learnings' && (
                          <>
                            <p style={{ color: 'var(--text-sub)', fontSize: '0.885rem', marginTop: '14px', marginBottom: '12px' }}>
                              {section.intro}
                            </p>
                            <div className="learnings-grid">
                              {section.items.map((item, idx) => (
                                <div key={idx} className="learning-card">
                                  <span className="learning-num">{(idx + 1).toString().padStart(2, '0')}</span>
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              /* Future Quarter Placeholder Card (Q2, Q3, Q4) */
              <div className="future-plans-card">
                <div className="future-plans-icon">
                  <Calendar size={22} />
                </div>
                <div className="future-plans-title">{activeQuarter} Future Plans & Roadmap</div>
                <div className="future-plans-period">{currentQuarterData.period}</div>
                <div className="future-plans-desc">
                  Upcoming project milestones, infrastructure enhancements, and platform deliverables scheduled for {activeQuarter}. Detailed reporting will be populated as execution progresses.
                </div>
              </div>
            )}
          </>
        ) : (
          /* Monthly Slide / Image View */
          <div className="monthly-view-container">
            {/* Executive Month Selection Dropdown & Prev/Next Bar */}
            <div className={`monthly-control-bar ${isHeaderCollapsed ? 'is-collapsed' : ''}`}>
              <div className="month-select-wrapper">
                <Calendar size={16} className="select-icon" />
                <select
                  className="month-dropdown"
                  value={activeMonthId}
                  onChange={(e) => {
                    setActiveMonthId(e.target.value);
                    setActiveSlideIndex(0);
                  }}
                >
                  <optgroup label="Q1 (June - August 2026)">
                    <option value="june-2026">June 2026</option>
                    <option value="july-2026">July 2026</option>
                    <option value="august-2026">August 2026</option>
                  </optgroup>
                  <optgroup label="Q2 (September - November 2026)">
                    <option value="september-2026">September 2026</option>
                    <option value="october-2026">October 2026</option>
                    <option value="november-2026">November 2026</option>
                  </optgroup>
                  <optgroup label="Q3 (December 2026 - February 2027)">
                    <option value="december-2026">December 2026</option>
                    <option value="january-2027">January 2027</option>
                    <option value="february-2027">February 2027</option>
                  </optgroup>
                  <optgroup label="Q4 (March - May 2027)">
                    <option value="march-2027">March 2027</option>
                    <option value="april-2027">April 2027</option>
                    <option value="may-2027">May 2027</option>
                  </optgroup>
                </select>
                <ChevronDown size={16} className="select-arrow" />
              </div>

              <div className="month-nav-buttons">
                <button
                  className="btn-month-nav"
                  onClick={handlePrevMonth}
                  disabled={currentMonthIndex === 0}
                  title="Previous Month"
                >
                  <ChevronLeft size={16} /> Prev Month
                </button>
                <button
                  className="btn-month-nav"
                  onClick={handleNextMonth}
                  disabled={currentMonthIndex === monthlyReports.length - 1}
                  title="Next Month"
                >
                  Next Month <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Monthly Image Showcase Card */}
            <div className="monthly-showcase-card">
              <div className="showcase-header">
                <div className="showcase-title">{currentMonthData.month} Slide</div>
                {currentMonthData.description && (
                  <div className="showcase-subtitle">{currentMonthData.description}</div>
                )}
              </div>

              {/* Slide Frame */}
              <div className="slide-viewport" onClick={() => currentSlide.src && setLightboxOpen(true)}>
                {currentSlide.src ? (
                  <>
                    <img
                      src={currentSlide.src}
                      alt={currentSlide.title}
                      className="slide-image"
                    />
                    <div className="slide-overlay-caption">
                      {currentSlide.caption && <span className="slide-caption-text">{currentSlide.caption}</span>}
                      <button className="slide-zoom-btn">
                        <Maximize2 size={13} style={{ display: 'inline', marginRight: 4 }} />
                        Full Screen
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="empty-slide-placeholder">
                    <ImageIcon size={36} color="var(--accent-primary)" style={{ opacity: 0.6 }} />
                    <span>No image provided for {currentMonthData.month} yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Executive Page Footer — Spans Full 100% Screen Width */}
      <footer className={`app-footer ${isHeaderCollapsed ? 'is-collapsed' : ''}`}>
        <div className="footer-content">
          <div className="footer-note-card">
            <span className="footer-note-icon">📌</span>
            <div className="footer-note-text">
              {renderFormattedText(feedbackFormConfig.footerNote || "**Note:** This report focuses on major outcomes and completed deliverables. Daily troubleshooting, brainstorming sessions, and internal discussion notes are omitted here.")}
            </div>
          </div>
          
          <div className="footer-bottom-bar">
            <div className="footer-copyright">
              Executive Performance Report • Presented by <strong>Vishal Tyagi</strong>
            </div>
          </div>
        </div>
      </footer>

      {/* Reviewer Feedback Modal */}
      {feedbackModalOpen && (
        <div className="modal-backdrop" onClick={() => setFeedbackModalOpen(false)}>
          <div className={`feedback-modal-card ${isEditorExpanded ? 'is-expanded' : ''}`} onClick={e => e.stopPropagation()}>
            <div className="feedback-modal-header">
              <div className="feedback-modal-title">
                <span className="modal-title-icon-badge">
                  <MessageSquareHeart size={18} />
                </span>
                <span>{feedbackFormConfig.headerTitle || "Reviewer Feedback & Evaluation"}</span>
              </div>
              <button
                className="lightbox-close-btn"
                onClick={() => setFeedbackModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="feedback-success-msg">
                <CheckCircle2 size={20} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                {feedbackFormConfig.successMessage || "Thank you for reviewing my report! Your evaluation has been submitted."}
              </div>
            ) : (
              <form onSubmit={handleSendFeedback}>
                <p className="feedback-modal-desc">
                  {feedbackFormConfig.description}
                </p>

                {/* Required Quarter Selection Field (Unselected by Default) */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {feedbackFormConfig.quarterLabel || "Target Quarter (Required)"} *
                  </label>
                  <div className="month-select-wrapper">
                    <Calendar size={16} className="select-icon" />
                    <select
                      required
                      className="month-dropdown"
                      style={{ padding: '8px 36px 8px 36px', fontSize: '0.85rem', fontWeight: 600 }}
                      value={selectedQuarterForFeedback}
                      onChange={(e) => setSelectedQuarterForFeedback(e.target.value)}
                    >
                      <option value="" disabled>-- Select Quarter --</option>
                      {(feedbackFormConfig.quarterOptions || []).map(q => (
                        <option key={q.value} value={q.value}>{q.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="select-arrow" />
                  </div>
                </div>

                {/* Optional Reviewer Name Field */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {feedbackFormConfig.nameLabel || "Your Name (Optional)"}
                  </label>
                  <div className="month-select-wrapper">
                    <User size={16} className="select-icon" />
                    <input
                      type="text"
                      className="month-dropdown"
                      style={{ padding: '8px 12px 8px 36px', fontSize: '0.85rem', fontWeight: 500 }}
                      placeholder={feedbackFormConfig.namePlaceholder || "Enter your name (Optional)..."}
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Professional True WYSIWYG ContentEditable Rich Text Feedback Box */}
                <div className={`feedback-textarea-container ${isEditorExpanded ? 'is-expanded' : ''}`} style={{ marginBottom: 18 }}>
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className={`feedback-content-editable ${isEditorExpanded ? 'is-expanded' : ''}`}
                    data-placeholder={feedbackFormConfig.commentsPlaceholder || "Additional feedback, notes, or suggestions (Optional)..."}
                    onInput={handleEditorInput}
                    onKeyUp={updateToolbarState}
                    onMouseUp={updateToolbarState}
                  />

                  {/* Clean Bottom Footer Bar: Formatting Icons on Left, Counter & 1-Click Expand Button on Right */}
                  <div className="textarea-footer-bar">
                    <div className="toolbar-buttons">
                      <button
                        type="button"
                        className={`toolbar-btn ${isBold ? 'active' : ''}`}
                        onClick={() => execFormat('bold')}
                        title="Toggle Bold (B)"
                      >
                        <Bold size={13} />
                      </button>
                      <button
                        type="button"
                        className={`toolbar-btn ${isItalic ? 'active' : ''}`}
                        onClick={() => execFormat('italic')}
                        title="Toggle Italic (I)"
                      >
                        <Italic size={13} />
                      </button>
                      <button
                        type="button"
                        className={`toolbar-btn ${isUnderline ? 'active' : ''}`}
                        onClick={() => execFormat('underline')}
                        title="Toggle Underline (U)"
                      >
                        <Underline size={13} />
                      </button>
                      <button
                        type="button"
                        className={`toolbar-btn ${isUl ? 'active' : ''}`}
                        onClick={() => execFormat('insertUnorderedList')}
                        title="Bullet List"
                      >
                        <List size={13} />
                      </button>
                      <button
                        type="button"
                        className={`toolbar-btn ${isOl ? 'active' : ''}`}
                        onClick={() => execFormat('insertOrderedList')}
                        title="Numbered List"
                      >
                        <ListOrdered size={13} />
                      </button>
                    </div>
                    <div className="footer-right-actions">
                      <span className="char-counter">
                        {feedbackText.length.toLocaleString()} / 10,000
                      </span>
                      <button
                        type="button"
                        className={`btn-expand-editor ${isEditorExpanded ? 'active' : ''}`}
                        onClick={() => setIsEditorExpanded(prev => !prev)}
                        title={isEditorExpanded ? "Restore Normal Modal View" : "Expand to Wide View for Long Feedback (10,000 chars)"}
                      >
                        {isEditorExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                        <span className="expand-btn-text">{isEditorExpanded ? 'Restore' : 'Expand Wide'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5-Star Compact Rating Rows */}
                <div className="rating-section-title">
                  {feedbackFormConfig.sectionTitle || "PERFORMANCE EVALUATION (OPTIONAL)"}
                </div>
                <div className="ratings-compact-list">
                  {(feedbackFormConfig.ratingCriteria || []).map(item => {
                    const currentVal = ratings[item.key] || 0;
                    return (
                      <div key={item.key} className="rating-compact-row">
                        <div className="rating-row-info">
                          <span className="rating-label">{item.label}</span>
                          <span className={`rating-row-score ${currentVal > 0 ? 'active' : ''}`}>
                            {currentVal > 0 ? `${getEmojiForScore(currentVal)} ${currentVal} / 5.0` : 'Not Rated'}
                          </span>
                        </div>
                        <div
                          className="rating-star-group"
                          onPointerDown={(e) => dismissKeyboard()}
                        >
                          {[1, 2, 3, 4, 5].map(starIndex => {
                            const isFull = currentVal >= starIndex;
                            const isHalf = currentVal === starIndex - 0.5;
                            return (
                              <button
                                key={starIndex}
                                type="button"
                                className={`star-btn ${isFull ? 'full' : ''} ${isHalf ? 'half' : ''}`}
                                onClick={() => handleStarClick(item.key, starIndex)}
                                title={`Star ${starIndex}: 1st click = ${starIndex - 0.5}, 2nd click = ${starIndex}.0`}
                              >
                                {isHalf ? (
                                  <span className="half-star-wrapper">
                                    <Star size={20} className="star-icon star-bg" />
                                    <Star size={20} className="star-icon star-fg-half" />
                                  </span>
                                ) : (
                                  <Star size={20} className={`star-icon ${isFull ? 'star-filled' : 'star-empty'}`} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="feedback-actions full-width-action">
                  <button type="submit" className="btn-submit-feedback-full" disabled={isSubmitting}>
                    <span>{isSubmitting ? (feedbackFormConfig.submittingText || 'Submitting...') : (feedbackFormConfig.submitButtonText || 'Submit Evaluation')}</span>
                    <Send size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Modal for Full Screen Image Viewing */}
      {lightboxOpen && currentSlide.src && (
        <div className="lightbox-backdrop" onClick={() => setLightboxOpen(false)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <div className="lightbox-header">
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{currentSlide.title}</span>
              <button className="lightbox-close-btn" onClick={() => setLightboxOpen(false)}>
                <X size={16} /> Close
              </button>
            </div>
            <div className="lightbox-image-container">
              <img src={currentSlide.src} alt={currentSlide.title} className="lightbox-image" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
