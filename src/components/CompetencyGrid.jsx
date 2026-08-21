import React from 'react';
import { keyLearnings } from '../data/reportData';
import { Award, Check } from 'lucide-react';

export function CompetencyGrid() {
  return (
    <section className="learnings-section">
      <div className="section-tag">
        <Award size={14} /> Knowledge & Mastery
      </div>
      <h2 className="section-title" style={{ marginBottom: '4px' }}>
        Key Learnings & Core Competencies (15 Technical Domains)
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Hands-on exposure and practical implementation mastery acquired across Q3 engineering tasks
      </p>

      <div className="learnings-grid">
        {keyLearnings.map((item) => (
          <div key={item.id} className={`learning-card ${item.highlight ? 'highlight' : ''}`}>
            <span className="learning-num">{item.id.toString().padStart(2, '0')}</span>
            <div className="learning-info">
              <h5>{item.name}</h5>
              <span>{item.category}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
