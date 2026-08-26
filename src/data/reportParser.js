/**
 * Dynamic Markdown Report Parser
 * Converts human-friendly .md report files into structured performance data for rendering.
 */

export function parseMarkdownReport(mdText) {
  if (!mdText) return { period: '', sections: [] };

  const lines = mdText.split(/\r?\n/);
  let period = '';
  const sections = [];
  let currentSection = null;
  let currentSubSection = null;
  let currentMainBullet = null;
  let sectionIndex = 1;

  for (let rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) continue;

    // Period line: *Period: ...*
    if (/^\*Period:\s*(.*?)\*$/i.test(trimmed)) {
      const match = trimmed.match(/^\*Period:\s*(.*?)\*$/i);
      if (match) period = match[1];
      continue;
    }

    // Section header: ## Title `Badge` or ## Title [Badge] or ## Title
    if (line.startsWith('## ')) {
      const headerText = line.substring(3).trim();
      let title = headerText;
      let badge = '';

      // Match ONLY `Badge` or [Badge] at end of title (leaving parentheses (Text) as part of Title!)
      const badgeMatch = headerText.match(/^(.*?)\s*(?:[`\[](.*?)[`\]])$/);
      if (badgeMatch) {
        title = badgeMatch[1].trim();
        badge = badgeMatch[2].trim();
      }

      currentSection = {
        id: String(sectionIndex++).padStart(2, '0'),
        title,
        badge,
        type: 'bullets',
        bullets: [],
        subSections: [],
        items: [],
        intro: ''
      };
      sections.push(currentSection);
      currentSubSection = null;
      currentMainBullet = null;
      continue;
    }

    if (!currentSection) continue;

    // Subsection header: ### Title
    if (line.startsWith('### ')) {
      const subTitle = line.substring(4).trim();
      currentSection.type = 'subsections';
      currentSubSection = {
        title: subTitle,
        bullets: []
      };
      currentSection.subSections.push(currentSubSection);
      currentMainBullet = null;
      continue;
    }

    // Numbered item for Learnings grid: 1. Item
    if (/^\d+\.\s+/.test(trimmed)) {
      currentSection.type = 'learnings';
      const itemText = trimmed.replace(/^\d+\.\s+/, '');
      currentSection.items.push(itemText);
      continue;
    }

    // Handle Learnings section intro text
    if (currentSection.type === 'learnings') {
      if (!trimmed.startsWith('#')) {
        currentSection.intro = trimmed;
      }
      continue;
    }

    // Check if line is bullet (starts with - or *) or standalone line / link
    const isIndented = /^\s{2,}/.test(rawLine);
    let bulletContent = trimmed;

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      bulletContent = trimmed.substring(2).trim();
    }

    if (isIndented && currentMainBullet) {
      // Indented line (sub-bullet or sub-link) -> attach to main bullet group
      if (currentMainBullet.type !== 'group') {
        currentMainBullet.type = 'group';
        currentMainBullet.main = currentMainBullet.text;
        currentMainBullet.items = [];
        delete currentMainBullet.text;
      }
      currentMainBullet.items.push(bulletContent);
    } else {
      // Main bullet or standalone line / link
      const newBullet = { type: 'text', text: bulletContent };
      if (currentSubSection) {
        currentSubSection.bullets.push(newBullet);
      } else {
        currentSection.bullets.push(newBullet);
      }
      currentMainBullet = newBullet;
    }
  }

  return { period, sections };
}
