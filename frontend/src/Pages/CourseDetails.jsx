import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock, BarChart3, BookOpen, PlayCircle, CheckCircle2,
  ArrowLeft, Award, Users, Sparkles, CheckSquare
} from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import { coursesAPI } from '../components/services/api';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchCourse = async () => {
      try {
        const response = await coursesAPI.getById(id);
        if (mounted) setCourse(response.data);
      } catch (err) {
        if (mounted) setError(err.response?.data?.detail || 'Unable to load course syllabus.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCourse();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading course modules...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="error-state">
        <div className="error-state-icon">⚠️</div>
        <div className="error-state-title">{error || 'Course not found'}</div>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/courses')}>
          <ArrowLeft size={16} /> Back to Courses
        </button>
      </div>
    );
  }

  const modules = course.modules || course.lessons || course.syllabus || [];
  const progress = course.progress ?? course.completion_percentage ?? 0;
  const skillsCovered = course.skills_covered || course.skills || [];

  return (
    <div className="fade-in">
      <Link
        to="/courses"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          color: 'var(--accent-gold)',
          fontSize: '0.84375rem',
          fontWeight: 600,
          marginBottom: '1.25rem'
        }}
      >
        <ArrowLeft size={16} /> Back to Course Catalog
      </Link>

      {/* HERO COURSE CARD */}
      <div className="card" style={{ overflow: 'hidden', marginBottom: '2rem' }}>
        <div className="course-card-cover" style={{ height: 180 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'rgba(212, 178, 111, 0.2)',
            border: '1px solid var(--border-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-gold)'
          }}>
            <BookOpen size={30} />
          </div>
        </div>

        <div style={{ padding: '2.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <span className="section-label">{course.category || course.domain || 'Learning Path'}</span>
              <h1 style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.15rem)',
                fontWeight: 700,
                color: 'var(--text-cream)',
                fontFamily: 'var(--font-serif)',
                marginBottom: '0.75rem',
                lineHeight: 1.25
              }}>
                {course.title || course.name}
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {course.description}
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span className="badge badge-primary">
                  <Clock size={13} /> {course.duration || 'Self-paced'}
                </span>
                <span className="badge badge-info">
                  <BarChart3 size={13} /> {course.level || 'All Levels'}
                </span>
                <span className="badge badge-success">
                  <Award size={13} /> {course.credits || 'Verified Competency'}
                </span>
                {course.enrolled_count != null && (
                  <span className="badge badge-warning">
                    <Users size={13} /> {course.enrolled_count} Learners Enrolled
                  </span>
                )}
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface-elevated)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)',
              minWidth: 240
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Curriculum Progress</span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>{Math.round(progress)}%</span>
                </div>
                <ProgressBar value={progress} height={8} />
              </div>

              <button className="btn btn-primary btn-block">
                <PlayCircle size={18} />
                <span>{progress > 0 ? 'Resume Course' : 'Start Course'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2-COLUMN: SYLLABUS & ABOUT */}
      <div className="grid grid-2">
        {/* Module Content */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div className="section-head">
            <h3>Course Syllabus</h3>
            <small>{modules.length} Modules</small>
          </div>

          {modules.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">Syllabus modules indexing</div>
              <div className="empty-state-description">Detailed chapter content is currently being finalized.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {modules.map((mod, idx) => {
                const isCompleted = mod.completed;
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.875rem',
                      padding: '0.875rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <CheckCircle2
                      size={18}
                      style={{
                        color: isCompleted ? 'var(--status-success)' : 'var(--text-muted)',
                        flexShrink: 0
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: isCompleted ? 'var(--text-cream)' : 'var(--text-primary)'
                      }}>
                        {mod.title || mod.name || `Module ${idx + 1}`}
                      </div>
                      {mod.duration && (
                        <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>
                          {mod.duration}
                        </div>
                      )}
                    </div>
                    {isCompleted && (
                      <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>
                        Done
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* About & Competencies */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div className="section-head">
            <h3>About This Course</h3>
            <small>Competency Scope</small>
          </div>

          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            <p style={{ marginBottom: '1.5rem' }}>
              {course.long_description || course.description ||
                'This course has been curated to build rigorous, demonstrable competencies aligned with current industry benchmarks.'}
            </p>

            {skillsCovered.length > 0 && (
              <div>
                <h4 style={{
                  fontSize: '0.90625rem',
                  fontWeight: 700,
                  color: 'var(--text-cream)',
                  marginBottom: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}>
                  <Sparkles size={14} style={{ color: 'var(--accent-gold)' }} />
                  Target Skills Covered
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {skillsCovered.map((skill, idx) => (
                    <span key={idx} className="badge badge-primary">
                      {typeof skill === 'string' ? skill : skill.name || skill.skill_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CourseDetails);
