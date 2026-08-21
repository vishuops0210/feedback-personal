import React from 'react';
import { executiveSummary } from '../data/reportData';

export function Footer() {
  return (
    <footer className="footer-root">
      <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
        Quarterly Engineering Showcase • {executiveSummary.period}
      </p>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
        Prepared for Management Review • Built with React & Modern Cloud Engineering Showcase Standards
      </p>
    </footer>
  );
}
