import React, { useState } from 'react';

const QuizCard = ({ question, onAnswer, index }) => {
  const [selected, setSelected] = useState(null);

  if (!question) return null;

  const options = question.options || question.choices || [];
  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    onAnswer?.(options[idx]);
  };

  return (
    <div className="quiz-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--accent-gold)'
        }}>
          Question {index + 1}
        </span>
      </div>

      <h3 style={{
        fontSize: '1.1875rem',
        fontWeight: 600,
        marginBottom: '1.5rem',
        color: 'var(--text-cream)',
        fontFamily: 'var(--font-serif)',
        lineHeight: 1.45
      }}>
        {question.question || question.text}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {options.map((opt, idx) => {
          let stateClass = '';
          if (selected === idx) stateClass = 'selected';

          return (
            <div
              key={idx}
              className={`quiz-option ${stateClass} ${selected === idx ? 'selected' : ''}`}
              onClick={() => handleSelect(idx)}
            >
              <span style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(212, 178, 111, 0.12)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.78125rem',
                color: 'var(--accent-gold)',
                flexShrink: 0
              }}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span style={{ flex: 1 }}>{opt}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(QuizCard);
