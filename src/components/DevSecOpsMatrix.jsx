import React from 'react';
import { ciTechStacks } from '../data/reportData';
import { ShieldCheck, Code2, Atom, Server, Globe, Layout, Zap, Box, ExternalLink } from 'lucide-react';

const iconMap = {
  Code2: Code2,
  Atom: Atom,
  Server: Server,
  Globe: Globe,
  Layout: Layout,
  Zap: Zap,
  Box: Box
};

export function DevSecOpsMatrix() {
  return (
    <section className="matrix-section">
      <div className="section-tag">
        <ShieldCheck size={14} /> OT-Central CI Automation
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="section-title" style={{ marginBottom: '4px' }}>
            Supported DevSecOps Multi-Application Stacks
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Full DevSecOps scanning (SAST, SCA, Secrets Detection) + Automated CD Actions for AWS Lambda
          </p>
        </div>

        <a
          href="https://docs.opstree.dev/doc/github-G6Q7shnNly"
          target="_blank"
          rel="noreferrer"
          className="btn-secondary"
          style={{ fontSize: '0.8rem' }}
        >
          View Dashboard Architecture Doc <ExternalLink size={14} />
        </a>
      </div>

      <div className="stacks-grid">
        {ciTechStacks.map((stack, idx) => {
          const Icon = iconMap[stack.icon] || Code2;
          return (
            <div key={idx} className="stack-card">
              <div className="stack-icon-name">
                <Icon size={20} color="var(--accent-teal)" />
                <h4>{stack.name}</h4>
              </div>
              <p className="stack-desc">{stack.desc}</p>
              <div className="stack-sec-tag">
                🔒 {stack.security}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
