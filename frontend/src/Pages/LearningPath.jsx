import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, CheckCircle2, Circle, Lock, ArrowRight,
  PlayCircle, Sparkles, Compass
} from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import { coursesAPI } from '../components/services/api';

const LearningPath = () => {
  const [path, setPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchPath = async () => {
      try {
        const response = await coursesAPI.getLearningPath();
        if (mounted) setPath(response.data?.path || []);
      } catch (err) {
        if (mounted) setError(err.response?.data?.detail || 'Unable to assemble personalized learning roadmap.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPath();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Synthesizing personalized competency path...</p>
      </div>
    );
  }

  const completed = path.filter((p) => p.status === 'completed' || p.completed).length;
  const totalProgress = path.length ? Math.round((completed / path.length) * 100) : 0;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Personalized Learning Path</h1>
        <p className="page-subtitle">A structured, algorithmic roadmap configured to close your identified skill gaps.</p>
      </div>

      {error && (
        <div className="error-state" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <div className="error-state-title">{error}</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84375rem' }}>
            Could not synchronize learning path. Please verify backend connection.
          </p>
        </div>
      )}

      {path.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗺️</div>
          <div className="empty-state-title">No personalized learning path mapped yet</div>
          <div className="empty-state-description">
            Complete your diagnostic assessment or skill gap evaluation to construct your guided pathway.
          </div>
          <Link to="/skill-gap" className="btn btn-primary mt-4">
            <span>Analyze Skill Gaps</span> <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div>
          {/* OVERVIEW PROGRESS SUMMARY CARD */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div className="stat-icon stat-icon-primary" style={{ width: 56, height: 56 }}>
                <GraduationCap size={28} />
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  color: 'var(--text-cream)',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>Milestone Velocity</span>
                  <span style={{ color: 'var(--accent-gold)' }}>{totalProgress}% Complete</span>
                </div>
                <ProgressBar value={totalProgress} height={10} />
              </div>
              <div style={{
                textAlign: 'center',
                padding: '0.75rem 1.5rem',
                background: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-gold)', fontFamily: 'var(--font-serif)', lineHeight: 1.1 }}>
                  {completed} / {path.length}
                </div>
                <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginTop: '0.25rem' }}>
                  Modules Completed
                </div>
              </div>
            </div>
          </div>

          {/* CONNECTED TIMELINE ROADMAP */}
          <div style={{ position: 'relative', paddingLeft: '2.5rem' }}>
            {/* Vertical connector line */}
            <div style={{
              position: 'absolute',
              left: 17,
              top: 14,
              bottom: 14,
              width: 2,
              background: 'linear-gradient(180deg, var(--accent-gold) 0%, rgba(212, 178, 111, 0.2) 100%)'
            }} />

            {path.map((step, idx) => {
              const isCompleted = step.status === 'completed' || step.completed;
              const isCurrent = step.status === 'current' || step.current;
              const isLocked = step.status === 'locked' || step.locked;
              const stepId = step.course_id || step.id || step._id;

              return (
                <div key={idx} style={{ position: 'relative', marginBottom: '1.75rem' }}>
                  {/* Node icon circle */}
                  <div style={{
                    position: 'absolute',
                    left: '-2.5rem',
                    top: 12,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: isCompleted
                      ? 'var(--status-success)'
                      : isCurrent
                      ? 'var(--accent-gold)'
                      : 'var(--bg-surface-elevated)',
                    border: `2px solid ${isCurrent ? 'var(--accent-gold-light)' : 'var(--border-subtle)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCompleted || isCurrent ? '#0c1c16' : 'var(--text-muted)',
                    zIndex: 2,
                    boxShadow: isCurrent ? '0 0 16px rgba(212, 178, 111, 0.4)' : 'none'
                  }}>
                    {isCompleted ? (
                      <CheckCircle2 size={16} strokeWidth={2.5} />
                    ) : isLocked ? (
                      <Lock size={14} />
                    ) : (
                      <span style={{ fontWeight: 800, fontSize: '0.8125rem' }}>{idx + 1}</span>
                    )}
                  </div>

                  {/* Step Card */}
                  <div
                    className="card card-hover"
                    style={{
                      padding: '1.5rem',
                      opacity: isLocked ? 0.65 : 1,
                      borderLeft: isCurrent ? '3px solid var(--accent-gold)' : undefined
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 240 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-cream)' }}>
                            {step.title || step.course_title || step.name || `Phase ${idx + 1}`}
                          </h3>
                          {isCompleted && <span className="badge badge-success">Completed</span>}
                          {isCurrent && <span className="badge badge-primary">Current Focus</span>}
                          {isLocked && <span className="badge badge-warning">Prerequisite Pending</span>}
                        </div>

                        <p style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', marginBottom: '0.875rem', lineHeight: 1.6 }}>
                          {step.description || 'Master key competencies in this module to proceed to subsequent specialization.'}
                        </p>

                        {step.skills?.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                            {step.skills.map((skill, i) => (
                              <span key={i} className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {!isLocked && stepId && (
                        <Link to={`/courses/${stepId}`} className="btn btn-sm btn-primary">
                          <span>{isCompleted ? 'Review' : isCurrent ? 'Continue' : 'Start'}</span>
                          <PlayCircle size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(LearningPath);
