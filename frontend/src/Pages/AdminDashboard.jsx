import React, { useState, useEffect } from 'react';
import {
  Users, BookOpen, Award, TrendingUp, ShieldCheck, Activity,
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, UserCheck
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    if (mounted) setLoading(false);
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading administrative dashboard metrics...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentUsers = Array.isArray(data?.recent_users) ? data.recent_users : [];
  const topCourses = Array.isArray(data?.top_courses) ? data.top_courses : [];
  const activities = Array.isArray(data?.activity) ? data.activity : [];
  const recommendations = Array.isArray(data?.recommendations) ? data.recommendations : [];

  return (
    <div className="admin-page fade-in">
      {/* HEADER */}
      <header className="admin-header">
        <div>
          <h1 className="admin-title">Admin Overview</h1>
          <p className="admin-sub">Manage learning experiences, skills, courses and platform activity.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span className="badge badge-primary">
            <ShieldCheck size={13} /> Administrator Console
          </span>
        </div>
      </header>

      {/* ERROR BANNER */}
      {error && (
        <div className="error-state" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <div className="error-state-title">{error}</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84375rem' }}>
            Live admin backend telemetry is currently offline or unreachable.
          </p>
        </div>
      )}

      {/* SECTION 1: PLATFORM OVERVIEW (METRICS) */}
      <section className="admin-metrics" aria-label="Platform Overview Metrics">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">
            <Users size={22} />
          </div>
          <div>
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats.total_users ?? 0}</div>
            <div className="stat-change">Registered platform accounts</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            <BookOpen size={22} />
          </div>
          <div>
            <div className="stat-label">Active Courses</div>
            <div className="stat-value">{stats.total_courses ?? 0}</div>
            <div className="stat-change">Published curricula</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">
            <Award size={22} />
          </div>
          <div>
            <div className="stat-label">Assessments</div>
            <div className="stat-value">{stats.total_assessments ?? 0}</div>
            <div className="stat-change">Completed evaluations</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-info">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="stat-label">Avg. Completion</div>
            <div className="stat-value">{stats.avg_completion ?? 0}%</div>
            <div className="stat-change">Platform-wide momentum</div>
          </div>
        </div>
      </section>

      {/* SECTION 2 & 3: USER MANAGEMENT & COURSE MANAGEMENT & ACTIVITY */}
      <section className="admin-grid">
        {/* User Management Table */}
        <div className="card admin-panel">
          <h3 className="panel-title">User Management</h3>
          {recentUsers.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state-title">No user records available</div>
              <p style={{ fontSize: '0.8125rem' }}>Registered accounts will be tabulated here.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Learner</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="user-cell">
                          <span className="user-name">{u.name || 'Anonymous User'}</span>
                          <span className="user-email">{u.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary">
                          {u.role || 'employee'}
                        </span>
                      </td>
                      <td>
                        {u.active === false ? (
                          <span className="badge badge-danger">Inactive</span>
                        ) : (
                          <span className="badge badge-success">Active</span>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.625rem' }}>
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Course Management */}
        <div className="card admin-panel">
          <h3 className="panel-title">Course Management</h3>
          {topCourses.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state-title">No course data</div>
              <p style={{ fontSize: '0.8125rem' }}>Course metrics will display once learners enroll.</p>
            </div>
          ) : (
            <div className="course-list">
              {topCourses.map((c, idx) => (
                <div key={idx} className="course-row">
                  <div>
                    <div className="course-title">{c.title || c.name || 'Course Unit'}</div>
                    <div className="course-meta">
                      {c.enrollment_count ?? c.enrollments ?? 0} active enrollments
                    </div>
                  </div>
                  <button className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.625rem' }}>
                    Manage
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Platform Activity */}
        <div className="card admin-panel">
          <h3 className="panel-title">Platform Activity</h3>
          {activities.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state-title">No recent activity</div>
              <p style={{ fontSize: '0.8125rem' }}>System audits and learner milestones stream here.</p>
            </div>
          ) : (
            <ul className="activity-list">
              {activities.slice(0, 7).map((act, idx) => (
                <li key={idx} className="activity-item">
                  <div className="activity-meta">
                    {act.user_name || act.actor || 'System'} • <span style={{ color: 'var(--accent-gold)' }}>{act.action}</span>
                  </div>
                  <div className="activity-time">
                    {act.time ? new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* SECTION 4 & 5: ANALYTICS & AI INSIGHTS */}
      <section className="admin-bottom">
        <div className="card admin-panel">
          <h3 className="panel-title">System Analytics</h3>
          {data?.analytics ? (
            <div style={{
              background: 'var(--bg-surface-elevated)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              overflow: 'auto',
              maxHeight: 220
            }}>
              <pre style={{ color: 'var(--accent-gold-light)', fontSize: '0.8125rem', fontFamily: 'monospace' }}>
                {JSON.stringify(data.analytics, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <Activity size={32} style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem', opacity: 0.6 }} />
              <div className="empty-state-title">Telemetry Synchronization Normal</div>
              <p style={{ fontSize: '0.8125rem' }}>Detailed analytics logs will populate when continuous background analysis completes.</p>
            </div>
          )}
        </div>

        <div className="card admin-panel">
          <h3 className="panel-title">AI & Recommendation Insights</h3>
          {recommendations.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <Sparkles size={32} style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem', opacity: 0.6 }} />
              <div className="empty-state-title">No AI anomalies flagged</div>
              <p style={{ fontSize: '0.8125rem' }}>AI recommendation matching is performing within expected variance.</p>
            </div>
          ) : (
            <div className="insights-list">
              {recommendations.slice(0, 5).map((rec, idx) => (
                <div key={idx} className="insight-item">
                  <div style={{ fontWeight: 700, color: 'var(--text-cream)', fontSize: '0.875rem' }}>
                    {rec.title || rec.name}
                  </div>
                  {rec.note && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78125rem', marginTop: '0.25rem' }}>
                      {rec.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default React.memo(AdminDashboard);
