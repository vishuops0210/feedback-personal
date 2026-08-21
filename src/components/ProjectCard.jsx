import React from 'react';
import { ArrowRight, CheckCircle2, Clock, ExternalLink } from 'lucide-react';

export function ProjectCard({ project, onSelect }) {
  return (
    <div className="project-card" onClick={() => onSelect(project)}>
      <div>
        <div className="project-card-header">
          <div>
            <span className="project-client-badge">{project.client}</span>
            <h3 className="project-title">{project.title}</h3>
          </div>
          <span className="project-month-pill">{project.month}</span>
        </div>

        <p className="project-summary">{project.summary}</p>

        <div className="project-tags">
          {project.tags.map((tag) => (
            <span key={tag} className="tag-pill">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="project-footer">
        <div className="metric-highlight">
          <span className="val">{project.metrics.keyMetric}</span>
          <span className="lbl">{project.metrics.keyLabel}</span>
        </div>

        <div className="view-details-btn">
          View Details <ArrowRight size={14} />
        </div>
      </div>
    </div>
  );
}
