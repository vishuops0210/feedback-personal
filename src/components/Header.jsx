import React from 'react';
import { Search, Printer, Sparkles, Filter, Calendar } from 'lucide-react';
import { executiveSummary } from '../data/reportData';

export function Header({
  activeMonth,
  setActiveMonth,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  categories,
  onPrint
}) {
  return (
    <header className="header-root">
      <div className="header-top">
        <div>
          <div className="brand-badge">
            <span className="pulse-dot"></span>
            {executiveSummary.quarter} • {executiveSummary.period}
          </div>
          <h1 className="main-title">
            Engineering & DevOps <span>Quarterly Showcase</span>
          </h1>
          <p className="subtitle">
            Executive overview of cloud infrastructure, GitOps optimizations, DevSecOps pipelines, LiteLLM gateway, and platform engineering deliverables by <strong>{executiveSummary.author}</strong> ({executiveSummary.role}).
          </p>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={onPrint} title="Print or export as PDF">
            <Printer size={16} />
            Presentation Mode / PDF
          </button>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="controls-bar">
        <div className="month-tabs">
          <button
            className={`month-btn ${activeMonth === 'All' ? 'active' : ''}`}
            onClick={() => setActiveMonth('All')}
          >
            All Months
          </button>
          <button
            className={`month-btn ${activeMonth === 'June' ? 'active' : ''}`}
            onClick={() => setActiveMonth('June')}
          >
            June
          </button>
          <button
            className={`month-btn ${activeMonth === 'July' ? 'active' : ''}`}
            onClick={() => setActiveMonth('July')}
          >
            July
          </button>
          <button
            className={`month-btn ${activeMonth === 'August' ? 'active' : ''}`}
            onClick={() => setActiveMonth('August')}
          >
            August
          </button>
        </div>

        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search deliverables, tools, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Chips */}
      <div className="category-filter-bar">
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
          <Filter size={14} /> Filter:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`cat-chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </header>
  );
}
