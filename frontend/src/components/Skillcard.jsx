import React from 'react';

const getLevelClass = (level) => {
  const lvl = String(level || '').toLowerCase();
  if (lvl.includes('beginner') || lvl.includes('basic')) return 'level-beginner';
  if (lvl.includes('intermediate') || lvl.includes('mid')) return 'level-intermediate';
  if (lvl.includes('advanced') || lvl.includes('proficient')) return 'level-advanced';
  if (lvl.includes('expert') || lvl.includes('master')) return 'level-expert';
  return 'level-beginner';
};

const Skillcard = ({ skill }) => {
  if (!skill) return null;
  const name = skill.name || skill.skill_name || 'Skill';
  const numericLevel = Number(skill.proficiency_level ?? skill.current_level);
  const levelNames = ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];
  const level = skill.level || skill.proficiency || (numericLevel ? levelNames[numericLevel - 1] : 'Beginner');
  const score = Math.round(Number(skill.score ?? skill.value ?? skill.proficiency_score ?? (numericLevel ? numericLevel * 20 : 0)) || 0);

  return (
    <div className="skill-card">
      <div className="skill-card-header">
        <span className="skill-card-name">{name}</span>
        <span className={`skill-card-level ${getLevelClass(level)}`}>{level}</span>
      </div>
      <div className="skill-bar-container" style={{ marginBottom: 0 }}>
        <div className="skill-bar-header">
          <span className="skill-bar-name" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Proficiency</span>
          <span className="skill-bar-value" style={{ fontSize: '0.78125rem' }}>{score}%</span>
        </div>
        <div className="skill-bar-track" style={{ height: 6 }}>
          <div
            className="skill-bar-fill"
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(Skillcard);
