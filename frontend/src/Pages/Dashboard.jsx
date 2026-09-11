import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Sparkles, Target, Award, ArrowRight, PlayCircle,
  Brain, Bot, CheckCircle2, TrendingUp, Compass, Flame, AlertCircle
} from 'lucide-react';
import { useAuth } from '../components/context/AuthContext';
import { coursesAPI, skillsAPI, recommendationsAPI, usersAPI } from '../components/services/api';
import ProgressBar from '../components/ProgressBar';
import CourseCard from '../components/CourseCard';
import Skillcard from '../components/Skillcard';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [learningPath, setLearningPath] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [skillGaps, setSkillGaps] = useState([]);
  const [learningStats, setLearningStats] = useState({ totalCourses: 0, completed: 0, inProgress: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [pathRes, recRes, skillRes, coursesRes, statsRes] = await Promise.allSettled([
          coursesAPI.getLearningPath(),
          recommendationsAPI.getAll(),
          skillsAPI.getSkillGaps(),
          coursesAPI.getAll(),
          usersAPI.getMyStats(),
        ]);

        if (!mounted) return;

        if (pathRes.status === 'fulfilled') {
          const pathData = pathRes.value.data?.path || [];
          setLearningPath(Array.isArray(pathData) ? pathData : []);
        }

        if (recRes.status === 'fulfilled') {
          const recData = recRes.value.data?.recommendations || recRes.value.data || [];
          setRecommendations(Array.isArray(recData) ? recData : []);
        }

        if (skillRes.status === 'fulfilled') {
          const skillData = skillRes.value.data?.gaps || skillRes.value.data?.skill_gaps || skillRes.value.data || [];
          setSkillGaps(Array.isArray(skillData) ? skillData : []);
        }
        if (coursesRes.status === 'fulfilled' || statsRes.status === 'fulfilled') {
          const catalog = coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value.data)
            ? coursesRes.value.data
            : [];
          const stats = statsRes.status === 'fulfilled' ? statsRes.value.data || {} : {};
          setLearningStats({
            totalCourses: catalog.length,
            completed: Number(stats.courses_completed || 0),
            inProgress: Number(stats.courses_in_progress || 0),
          });
        }
        if (pathRes.status === 'rejected' && recRes.status === 'rejected' && skillRes.status === 'rejected') {
          setError('Unable to synchronize dashboard telemetry.');
        }
      } catch (err) {
        if (mounted) setError('Failed to synchronize dashboard telemetry.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

  const completedCount = learningStats.completed;
  const inProgressList = learningPath.filter((p) => p.status === 'in_progress' || p.status === 'current' || p.current || p.in_progress);
  const totalProgress = learningStats.totalCourses
    ? Math.round((completedCount / learningStats.totalCourses) * 100)
    : 0;

  // Header Greeting Logic per specification:
  // "Good morning, [actual user name]." / "Keep learning. Keep growing."
  // If actual name unavailable: "Welcome back." (NEVER hardcode "Welcome back, Learner!")
  const firstName = user?.name ? user.name.trim().split(' ')[0] : null;
  const greetingHeading = firstName ? `Good morning, ${firstName}.` : 'Welcome back.';

  return (
    <div className="dashboard-page fade-in">
      {/* HEADER */}
      <header className="dashboard-header">
        <div>
          <h1 className="greeting">{greetingHeading}</h1>
          <p className="sub">Keep learning. Keep growing.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/quiz" className="btn btn-outline btn-sm">
            <CheckCircle2 size={14} /> Assess Skills
          </Link>
          <Link to="/courses" className="btn btn-primary btn-sm">
            <Compass size={14} /> Browse Catalog
          </Link>
        </div>
      </header>

      {/* Global Error Banner if API failed */}
      {error && (
        <div style={{
          background: 'var(--status-danger-bg)',
          color: '#fca5a5',
          padding: '0.875rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          border: '1px solid rgba(200, 90, 84, 0.3)'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* DASHBOARD 2-COLUMN GRID */}
      <div className="dashboard-grid">
        {/* MAIN COLUMN */}
        <div className="main-col">
          {/* SECTION 1: LEARNING PROGRESS */}
          <section className="card section section-progress">
            <div className="section-head">
              <h3>Learning Progress</h3>
              <small>Momentum & Milestones</small>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Calculating learning progress telemetry...</p>
              </div>
            ) : (
              <div>
                <div className="progress-overview">
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: 'var(--text-cream)',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>Curriculum Completion</span>
                      <span style={{ color: 'var(--accent-gold)' }}>{totalProgress}%</span>
                    </div>
                    <ProgressBar value={totalProgress} height={10} />
                  </div>

                  <div className="progress-stats">
                    <div className="stat">
                      <div className="stat-num">{learningStats.totalCourses}</div>
                      <div className="stat-label">Total Courses</div>
                    </div>
                    <div className="stat">
                      <div className="stat-num">{completedCount}</div>
                      <div className="stat-label">Completed</div>
                    </div>
                    <div className="stat">
                      <div className="stat-num" style={{ color: 'var(--status-success)' }}>
                        {learningStats.inProgress}
                      </div>
                      <div className="stat-label">In Progress</div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: CONTINUE LEARNING */}
                <div className="section-sub">Continue Learning</div>
                {inProgressList.length === 0 ? (
                  <div className="empty-state" style={{ padding: '1.5rem' }}>
                    <p>No active courses currently in progress. Start your next chapter from the catalog.</p>
                    <Link to="/courses" className="btn btn-primary btn-sm" style={{ marginTop: '0.875rem' }}>
                      Explore Available Courses <ArrowRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="continue-list">
                    {inProgressList.map((course, idx) => {
                      const courseId = course.course_id || course.id || course._id;
                      const courseTitle = course.title || course.course_title || course.name || 'Untitled Course';
                      const progressVal = course.progress ?? course.completion_percentage ?? 0;

                      return (
                        <div key={idx} className="continue-item">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-cream)', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                              {courseTitle}
                            </div>
                            <div style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginBottom: '0.625rem' }}>
                              {course.description || course.summary || 'Pick up where you left off.'}
                            </div>
                            <ProgressBar value={progressVal} height={6} />
                          </div>
                          <div>
                            <Link to={`/courses/${courseId}`} className="btn btn-primary btn-sm">
                              <span>Continue</span> <PlayCircle size={14} />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* SECTION 3: MY LEARNING PATH */}
          <section className="card section">
            <div className="section-head">
              <h3>My Learning Path</h3>
              <small>Completed • Current • Upcoming</small>
            </div>

            {loading ? (
              <div className="loading-state"><div className="spinner" /></div>
            ) : learningPath.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🗺️</div>
                <div className="empty-state-title">No learning path defined yet</div>
                <div className="empty-state-description">
                  Take a diagnostic assessment or run a skill gap analysis to generate your customized path.
                </div>
                <Link to="/skill-gap" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                  Analyze Skill Gaps <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="path-list">
                {learningPath.map((step, idx) => {
                  const isCompleted = step.status === 'completed' || step.completed;
                  const isCurrent = step.status === 'current' || step.current;
                  const stepTitle = step.title || step.course_title || step.name || `Module ${idx + 1}`;
                  const stepId = step.course_id || step.id || step._id;

                  return (
                    <div
                      key={idx}
                      className={`path-row ${isCompleted ? 'completed' : isCurrent ? 'active' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                        <div className="step-index">
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-cream)', fontSize: '0.90625rem' }}>
                            {stepTitle}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            {isCompleted ? 'Competency verified' : isCurrent ? 'In progress' : 'Upcoming curriculum'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.84375rem',
                          color: isCompleted ? 'var(--status-success)' : isCurrent ? 'var(--accent-gold)' : 'var(--text-muted)'
                        }}>
                          {Math.round(Number(step.progress ?? step.completion_percentage ?? (isCompleted ? 100 : 0)))}%
                        </span>
                        {stepId && (
                          <Link to={`/courses/${stepId}`} className="btn btn-outline btn-sm" style={{ padding: '0.3125rem 0.625rem' }}>
                            View
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* RECENT / FEATURED COURSES SHELF */}
          <section className="card section">
            <div className="section-head">
              <h3>Featured Courses</h3>
              <small>Explore Curricula</small>
            </div>

            {loading ? (
              <div className="loading-state"><div className="spinner" /></div>
            ) : learningPath.length === 0 ? (
              <div className="empty-state">
                <p>Browse our catalog to begin your next learning journey.</p>
                <Link to="/courses" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                  Open Courses Catalog
                </Link>
              </div>
            ) : (
              <div className="course-shelf">
                {learningPath.slice(0, 3).map((c, i) => (
                  <CourseCard
                    key={i}
                    course={{
                      id: c.course_id || c.id || c._id,
                      title: c.title || c.course_title || c.name,
                      description: c.description || c.summary,
                      duration: c.duration,
                      level: c.level,
                      progress: c.progress ?? c.completion_percentage ?? undefined,
                      category: c.category || c.domain
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* SIDEBAR ASIDE COLUMN */}
        <aside className="side-col">
          {/* SECTION 4: SKILL GAP */}
          <section className="card section">
            <div className="section-head">
              <h4>Skill Gap</h4>
              <Link to="/skill-gap" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                View All →
              </Link>
            </div>

            {loading ? (
              <div className="loading-state"><div className="spinner" /></div>
            ) : skillGaps.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem' }}>
                <p style={{ fontSize: '0.8125rem' }}>No active skill gap alerts. All evaluated benchmarks are currently met.</p>
                <Link to="/skill-gap" className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }}>
                  Run Gap Analysis
                </Link>
              </div>
            ) : (
              <div className="skills-list">
                {skillGaps.slice(0, 4).map((s, idx) => (
                  <Skillcard key={idx} skill={s} />
                ))}
              </div>
            )}
          </section>

          {/* SECTION 5: AI COURSE RECOMMENDATIONS */}
          <section className="card section">
            <div className="section-head">
              <h4>AI Recommendations</h4>
              <Link to="/recommendations" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                Explore →
              </Link>
            </div>

            {loading ? (
              <div className="loading-state"><div className="spinner" /></div>
            ) : recommendations.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem' }}>
                <p style={{ fontSize: '0.8125rem' }}>AI recommendations will be generated based on your assessments.</p>
              </div>
            ) : (
              <div className="rec-list">
                {recommendations.slice(0, 4).map((r, idx) => {
                  const rTitle = r.resource_title || 'Recommended Resource';
                  const rScore = r.recommendation_score ?? null;

                  return (
                    <div key={idx} className="rec-item">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 700,
                          fontSize: '0.84375rem',
                          color: 'var(--text-cream)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {rTitle}
                        </div>
                        {r.reason && (
                          <div style={{
                            fontSize: '0.71875rem',
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {r.reason}
                          </div>
                        )}
                      </div>
                      {rScore && (
                        <span style={{ fontSize: '0.78125rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                          {Math.round(rScore)}%
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* SECTION 6: ASSESSMENTS */}
          <section className="card section">
            <div className="section-head">
              <h4>Assessments</h4>
              <Link to="/quiz" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                Start Quiz →
              </Link>
            </div>
            <div style={{
              padding: '1rem',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
                <Brain size={18} style={{ color: 'var(--accent-gold)' }} />
                <span style={{ fontWeight: 700, color: 'var(--text-cream)', fontSize: '0.875rem' }}>
                  Competency Evaluation
                </span>
              </div>
              <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                Test your skills with AI-generated adaptive questions to pinpoint gap areas.
              </p>
              <Link to="/quiz" className="btn btn-outline btn-block btn-sm">
                Take Assessment
              </Link>
            </div>
          </section>

          {/* SECTION 7: CAREER & SKILL INSIGHTS */}
          <section className="card section">
            <div className="section-head">
              <h4>Career & Skill Insights</h4>
            </div>
            <div style={{
              padding: '1rem',
              background: 'linear-gradient(135deg, rgba(200, 109, 81, 0.12), rgba(212, 178, 111, 0.08))',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-gold)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <TrendingUp size={16} style={{ color: 'var(--accent-terracotta)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.84375rem', color: 'var(--text-cream)' }}>
                  Market Demand Alignment
                </span>
              </div>
              <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Roles matching your skill trajectory require higher proficiency in system architecture and cloud infrastructure.
              </p>
            </div>
          </section>

          {/* SECTION 8: AI LEARNING ASSISTANT COMPACT */}
          <section className="card section" style={{ background: 'linear-gradient(135deg, rgba(16, 38, 30, 0.95), rgba(22, 51, 40, 0.95))' }}>
            <div className="assistant-compact">
              <div>
                <div style={{
                  fontWeight: 800,
                  fontSize: '0.9375rem',
                  color: 'var(--text-cream)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}>
                  <Bot size={16} style={{ color: 'var(--accent-gold)' }} />
                  AI Learning Assistant
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78125rem', marginTop: '0.25rem' }}>
                  Ask questions, summarize concepts, or request path recommendations.
                </div>
              </div>
              <Link to="/assistant" className="btn btn-primary btn-sm">
                Chat
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default React.memo(Dashboard);
        
