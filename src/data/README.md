# 📊 Data Configuration & Markdown Reports Guide

This folder (`src/data/`) contains all the Markdown reports and customizable configuration files powering the Quarterly Performance Dashboard.

---

## 📂 File Structure Overview

### 1. `reports/` (`q1.md`, `q2.md`, `q3.md`, `q4.md`)
Human-friendly Markdown files for quarterly deliverables, section badges, bullet lists, sub-sections, and key learnings.

**Example Markdown Format (`q1.md`):**
```markdown
# Q1 Quarterly Performance Report
*Period: June, July & August 2026*

## Section Title `Done`
- Standard deliverable bullet item
  - Sub-deliverable 1 with `code` tag and **bold** text
  - Sub-deliverable 2 with links [Docs](https://...) and [Architecture](https://...)
```

---

### 2. `monthlyReports.json`
Manages all monthly slide data, image paths (`src`), titles, descriptions, and captions for all 12 months across Q1–Q4.

---

### 3. `feedbackFormConfig.json`
Manages feedback modal strings, placeholders, dropdown options, rating emojis, evaluation criteria parameters, and the **Footer Note**.

---

## 🎨 Text Formatting Guide for `.md` Files

| Style Type | Markdown Syntax | Rendered Output |
| :--- | :--- | :--- |
| **Inline Link** | `[Link Title](https://...)` | Clickable Pill Button with External Link Icon |
| **Tech Tag** | `\`Outline\`` or `{Outline}` | Gray/White Tech Code Pill Tag |
| **Bold Text** | `**1 configuration file**` | **Bold Text** |
| **Italic Text** | `*Important Note*` | *Italic Text* |
| **Status Badge** | `## Title \`Done\`` | Section Card with Status Badge Pill on Right |
