import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight, Brain, Sparkles } from 'lucide-react';
import { skillsAPI } from '../components/services/api';
import Skillcard from '../components/Skillcard';

const SkillGap = () => {
  const [gaps, setGaps] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const gapsRes = await skillsAPI.getSkillGaps();
        if (!mounted) return;
        const gapList = gapsRes.data?.gaps || [];
        setGaps(Array.isArray(gapList) ? gapList : []);
        setSkills(Array.isArray(gapList) ? gapList.map((gap) => ({
          skill_name: gap.skill_name,
          proficiency_level: gap.current_level,
        })) : []);
      } catch (err) {
        if (mounted) setError(err.response?.data?.detail || 'Unable to compute skill-gap diagnostics.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Analyzing role competency criteria against current benchmarks...</p>
      </div>
    );
  }

  const criticalGaps = gaps.filter((g) => g.gap_level === 'High');
  const moderateGaps = gaps.filter((g) => {
    return g.gap_level === 'Medium';
  });
  const metSkills = gaps.filter((g) => g.gap_level === 'Low' || g.gap_score === 0);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Skill Gap Analysis</h1>
        <p className="page-subtitle">Understand the variance between your verified abilities and target role proficiencies.</p>
      </div>

      {error && (
        <div className="error-state" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <div className="error-state-title">{error}</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84375rem' }}>
            Telemetry stream interrupted. Please re-run assessment.
          </p>
        </div>
      )}

      {/* TOP 3 SUMMARY STAT CARDS */}
      <div className="grid grid-3 mb-6" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon stat-icon-danger">
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="stat-label">Critical Gaps</div>
            <div className="stat-value" style={{ color: 'var(--accent-terracotta)' }}>{criticalGaps.length}</div>
            <div className="stat-change">Priority learning remediation</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="stat-label">Moderate Gaps</div>
            <div className="stat-value" style={{ color: 'var(--accent-gold)' }}>{moderateGaps.length}</div>
            <div className="stat-change">Secondary focus areas</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="stat-label">Skills Met</div>
            <div className="stat-value" style={{ color: 'var(--status-success)' }}>{metSkills.length}</div>
            <div className="stat-change">Satisfies benchmark criteria</div>
          </div>
        </div>
      </div>

      {gaps.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <div className="empty-state-title">No skill gap telemetry currently logged</div>
          <div className="empty-state-description">
            Complete an AI diagnostic assessment to measure your baseline skills and discover target focus areas.
          </div>
          <Link to="/quiz" className="btn btn-primary mt-4">
            <span>Take Diagnostic Assessment</span> <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-2">
          {/* Detailed Skill Gap Comparative Meters */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="section-head">
              <h3>Identified Discrepancies</h3>
              <small>{gaps.length} Metrics Analyzed</small>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {gaps.map((gap, idx) => {
                const gapValue = Number(gap.gap_score ?? 0) * 20;
                const required = Number(gap.required_level ?? gap.required ?? 0);
                const current = Number(gap.current_level ?? gap.current ?? 0);
                const isCritical = gap.gap_level === 'High';
                const isModerate = gap.gap_level === 'Medium';

                const color = isCritical
                  ? 'var(--accent-terracotta)'
                  : isModerate
                  ? 'var(--accent-gold)'
                  : 'var(--status-success)';

                return (
                  <div key={idx} className="skill-bar-container">
                    <div className="skill-bar-header">
                      <span className="skill-bar-name" style={{ color: 'var(--text-cream)' }}>
                        {gap.name || gap.skill_name || 'Competency Area'}
                      </span>
                      <span className="skill-bar-value" style={{ color }}>
                        Gap: {Math.round(gapValue)}%
                      </span>
                    </div>

                    <div className="skill-bar-track" style={{ height: 8 }}>
                      <div
                        className="skill-bar-fill"
                        style={{
                          width: `${Math.min(100, Math.max(0, gapValue))}%`,
                          background: color
                        }}
                      />
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.375rem'
                    }}>
                      <span>Current Proficiency: {Math.round(current)} / 5</span>
                      <span>Target Level: {Math.round(required)} / 5</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Skills Inventory */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="section-head">
              <h3>Verified Capabilities</h3>
              <small>{skills.length} Documented</small>
            </div>

            {skills.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <div className="empty-state-icon">📊</div>
                <div className="empty-state-title">No verified skills on record</div>
                <p style={{ fontSize: '0.8125rem' }}>Skills validated through completed assessments will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {skills.map((skill, idx) => (
                  <Skillcard key={idx} skill={skill} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default React.memo(SkillGap);
