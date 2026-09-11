import React from 'react';

const ProgressBar = ({ value = 0, color, height = 8, showLabel = false, label = 'Progress' }) => {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div className="skill-bar-header" style={{ marginBottom: '0.375rem' }}>
          <span className="skill-bar-name">{label}</span>
          <span className="skill-bar-value" style={{ color: color || 'var(--accent-gold)' }}>
            {Math.round(pct)}%
          </span>
        </div>
      )}
      <div
        className="progress-track"
        style={{ height }}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className="progress-fill"
          style={{
            width: `${pct}%`,
            background: color || undefined,
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(ProgressBar);