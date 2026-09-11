import React, { useEffect, useState } from 'react';
import { User, Mail, Briefcase, Save, Award, BookOpen, Clock, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../components/context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import { usersAPI } from '../components/services/api';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    designation: user?.designation || '',
    bio: user?.bio || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState(user?.stats || {});

  useEffect(() => {
    let active = true;
    usersAPI.getMyStats()
      .then((response) => {
        if (active) setStats(response.data || {});
      })
      .catch(() => {
        if (active) setStats({});
      });
    return () => { active = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    const result = await updateProfile({
      name: form.name,
      department: form.department || null,
      designation: form.designation || null,
    });
    if (result.success) {
      setMessage('Profile settings saved successfully.');
    } else {
      setError(result.error || 'Failed to update profile.');
    }
    setSaving(false);
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Learner Profile</h1>
        <p className="page-subtitle">Manage your personal credentials, departmental alignment, and learning history.</p>
      </div>

      {message && (
        <div style={{
          background: 'var(--status-success-bg)',
          color: '#6ee7b7',
          padding: '0.875rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          border: '1px solid rgba(78, 168, 125, 0.3)'
        }}>
          <CheckCircle2 size={16} /> {message}
        </div>
      )}

      {error && (
        <div style={{
          background: 'var(--status-danger-bg)',
          color: '#fca5a5',
          padding: '0.875rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          border: '1px solid rgba(200, 90, 84, 0.3)'
        }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-3">
        {/* IDENTITY CARD */}
        <div className="card" style={{ padding: '2rem 1.75rem', textAlign: 'center' }}>
          <div style={{
            width: 86,
            height: 86,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-terracotta))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0c1c16',
            fontSize: '2rem',
            fontWeight: 800,
            margin: '0 auto 1.25rem',
            border: '2px solid var(--border-gold)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
          }}>
            {initial}
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-cream)', marginBottom: '0.25rem' }}>
            {user?.name || 'Authorized Learner'}
          </h2>
          <span className="badge badge-primary" style={{ marginBottom: '1.5rem' }}>
            {user?.role === 'admin' ? 'Platform Administrator' : 'Active Learner'}
          </span>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
            textAlign: 'left',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.84375rem', color: 'var(--text-secondary)' }}>
              <Mail size={15} style={{ color: 'var(--accent-gold)' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.84375rem', color: 'var(--text-secondary)' }}>
              <Briefcase size={15} style={{ color: 'var(--accent-gold)' }} />
              <span>{user?.department || 'General Learning'}</span>
            </div>
          </div>
        </div>

        {/* EDIT PROFILE FORM */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div className="section-head">
            <h3>Edit Account Details</h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className="form-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="department">Department</label>
              <input
                id="department"
                type="text"
                className="form-input"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="designation">Designation / Specialization</label>
              <input
                id="designation"
                type="text"
                className="form-input"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="bio">Professional Summary</label>
              <textarea
                id="bio"
                className="form-input"
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Brief summary of learning goals..."
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
              <Save size={15} />
              <span>{saving ? 'Updating...' : 'Save Changes'}</span>
            </button>
          </form>
        </div>

        {/* LEARNING STATS */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div className="section-head">
            <h3>Learning Metrics</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="stat-card" style={{ background: 'var(--bg-surface-elevated)' }}>
              <div className="stat-icon stat-icon-primary">
                <Award size={20} />
              </div>
              <div>
                <div className="stat-label">Avg. Competency</div>
                <div className="stat-value">{stats.average_competency ?? 0}%</div>
              </div>
            </div>

            <div className="stat-card" style={{ background: 'var(--bg-surface-elevated)' }}>
              <div className="stat-icon stat-icon-success">
                <BookOpen size={20} />
              </div>
              <div>
                <div className="stat-label">Courses Completed</div>
                <div className="stat-value">{stats.courses_completed ?? 0}</div>
              </div>
            </div>

            <div className="stat-card" style={{ background: 'var(--bg-surface-elevated)' }}>
              <div className="stat-icon stat-icon-warning">
                <Clock size={20} />
              </div>
              <div>
                <div className="stat-label">Hours Invested</div>
                <div className="stat-value">{stats.hours_invested ?? 0}h</div>
              </div>
            </div>

            <div className="stat-card" style={{ background: 'var(--bg-surface-elevated)' }}>
              <div className="stat-icon stat-icon-info">
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="stat-label">Assessments Taken</div>
                <div className="stat-value">{stats.assessments_taken ?? 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Profile);
