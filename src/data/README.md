# 📊 Data Configuration & Text Formatting Reference Guide

This folder (`src/data/`) contains all the customizable JSON datasets powering the Quarterly Performance Report Dashboard.

---

## 🎨 Text Formatting Symbols Guide

You can use the following formatting symbols anywhere inside string values in `quarterlyReports.json`, `monthlyReports.json`, or `feedbackFormConfig.json`:

| Style Type | Symbol Syntax in JSON | Visual Output / Rendered Style |
| :--- | :--- | :--- |
| **Code Pill Tag** | `{Outline}` | Gray/White Code Tag (`Outline`) |
| **Blue Highlight** | `[blue:ArgoCD]` | 🟦 Soft Blue Shaded Tag |
| **Green Highlight** | `[green:Done]` | 🟩 Soft Green Shaded Tag |
| **Purple Highlight** | `[purple:LiteLLM]` | 🟪 Soft Purple Shaded Tag |
| **Orange Highlight** | `[orange:In-Progress]` | 🟧 Soft Orange Shaded Tag |
| **Red Highlight** | `[red:Urgent]` | 🟥 Soft Red Shaded Tag |
| **Bold Text** | `**1 configuration file**` | **Bold Text** |
| **Italic Text** | `*Important Note*` | *Italic Text* |

---

## 📂 File Structure Overview

### 1. `quarterlyReports.json`
Manages all quarterly project deliverables, section badges, bullet lists, sub-sections, and key learnings matrix for **Q1, Q2, Q3, and Q4**.

**Example:**
```json
{
  "type": "text",
  "text": "Created a POC for {Liquibase} with [blue:ArgoCD], [green:Done] and **1 configuration file**."
}
```

---

### 2. `monthlyReports.json`
Manages all monthly slide data, image paths (`src`), titles, descriptions, and captions for all 12 months across Q1–Q4.

---

### 3. `feedbackFormConfig.json`
Manages feedback modal strings, placeholders, dropdown options, rating emojis, evaluation criteria parameters, and the **Footer Note**.

**Footer Note Customization:**
```json
{
  "footerNote": "**Note:** This report focuses on major outcomes and completed deliverables. Daily troubleshooting, brainstorming sessions, and internal discussion notes are omitted here."
}
```
