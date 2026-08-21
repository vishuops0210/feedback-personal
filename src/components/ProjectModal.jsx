import React from 'react';
import { X, ExternalLink, Calendar, CheckCircle2, Tag } from 'lucide-react';

export function ProjectModal({ project, onClose }) {
  if (!project) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div>
          <span className="project-client-badge" style={{ fontSize: '0.85rem' }}>
            {project.client}
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', marginBottom: '8px', color: 'var(--text-primary)' }}>
            {project.title}
          </h2>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} color="var(--accent-teal)" /> {project.month}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} color="var(--accent-emerald)" /> {project.status}
            </span>
          </div>

          <div className="project-tags" style={{ marginBottom: '24px' }}>
            {project.tags.map((tag) => (
              <span key={tag} className="tag-pill" style={{ fontSize: '0.775rem' }}>
                #{tag}
              </span>
            ))}
          </div>

          <div className="modal-body">
            <h4 style={{ color: 'var(--accent-teal)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Detailed Deliverables & Implementation Highlights
            </h4>
            <div className="modal-body-text">{project.description}</div>

            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="external-link-btn"
              >
                Access Documentation Link <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
