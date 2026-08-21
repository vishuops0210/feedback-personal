import React from 'react';
import { Zap, Clock, Layers, Award } from 'lucide-react';
import { metricsData } from '../data/reportData';

const iconMap = {
  Zap: Zap,
  Clock: Clock,
  Layers: Layers,
  Award: Award
};

export function ExecutiveKpis() {
  return (
    <section className="kpi-grid">
      {metricsData.map((item) => {
        const IconComponent = iconMap[item.iconName] || Zap;
        return (
          <div key={item.id} className="kpi-card" style={{ borderColor: `rgba(${hexToRgb(item.color)}, 0.2)` }}>
            <div className="kpi-card-top">
              <div
                className="kpi-icon-wrap"
                style={{
                  background: `rgba(${hexToRgb(item.color)}, 0.12)`,
                  color: item.color
                }}
              >
                <IconComponent size={22} />
              </div>
              <span
                className="kpi-trend"
                style={{
                  background: `rgba(${hexToRgb(item.color)}, 0.15)`,
                  color: item.color
                }}
              >
                {item.trend}
              </span>
            </div>

            <div className="kpi-value">{item.value}</div>
            <div className="kpi-title">{item.title}</div>
            <div className="kpi-subtitle">{item.subtitle}</div>
          </div>
        );
      })}
    </section>
  );
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '6, 182, 212';
}
