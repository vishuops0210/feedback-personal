import React from 'react';
import { monthlyBreakdown } from '../data/reportData';
import { Calendar } from 'lucide-react';

export function MonthlyTimeline() {
  return (
    <section className="timeline-section">
      <div className="section-tag">
        <Calendar size={14} /> Quarter Chronology
      </div>
      <h2 className="section-title" style={{ marginBottom: '4px' }}>
        Month-by-Month Progress & Achievements
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Key milestones delivered from June to August 2026
      </p>

      <div className="timeline-cards">
        {monthlyBreakdown.map((item, idx) => (
          <div key={idx} className="timeline-month-card">
            <h3 className="timeline-month-title">{item.month}</h3>
            <div className="timeline-focus">Focus: {item.focus}</div>

            <ul className="timeline-list">
              {item.achievements.map((ach, i) => (
                <li key={i}>{ach}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
