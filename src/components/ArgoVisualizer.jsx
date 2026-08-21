import React, { useState } from 'react';
import { argoOptimizationFlow } from '../data/reportData';
import { ArrowRight, CheckCircle2, FileCode, Layers, ShieldCheck } from 'lucide-react';

export function ArgoVisualizer() {
  const [selectedPhase, setSelectedPhase] = useState(2);

  return (
    <section className="argo-banner-section">
      <div className="section-tag">
        <Layers size={14} /> GitOps Architecture Benchmark
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="section-title" style={{ marginBottom: '4px' }}>
            {argoOptimizationFlow.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Client: <strong>{argoOptimizationFlow.client}</strong> • Environment Scope: <code>Dev</code>, <code>UAT</code>, <code>Prod</code>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '99px', fontWeight: '700' }}>
            Multi-Environment Ready
          </span>
        </div>
      </div>

      <div className="argo-steps-grid">
        {argoOptimizationFlow.stages.map((stage, idx) => {
          const isSelected = selectedPhase === idx;
          const isFinal = idx === 2;
          return (
            <div
              key={idx}
              className={`argo-step-card ${isFinal ? 'active-final' : ''}`}
              style={{
                cursor: 'pointer',
                borderColor: isSelected ? stage.badgeColor : undefined,
                boxShadow: isSelected ? `0 0 20px rgba(${hexToRgb(stage.badgeColor)}, 0.2)` : undefined
              }}
              onClick={() => setSelectedPhase(idx)}
            >
              <div className="step-header">
                <span className="step-num">{stage.step}</span>
                <span className="step-badge" style={{ backgroundColor: stage.badgeColor }}>
                  {stage.status}
                </span>
              </div>
              <div className="step-count">{stage.filesCount}</div>
              <p className="step-desc">{stage.description}</p>

              {isFinal && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '6px' }}>
                  <span className="tag-pill" style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>Dev</span>
                  <span className="tag-pill" style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>UAT</span>
                  <span className="tag-pill" style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>Prod</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '16, 185, 129';
}
