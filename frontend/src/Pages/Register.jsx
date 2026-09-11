import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Briefcase, AlertCircle, GraduationCap, ArrowRight } from 'lucide-react';
import { useAuth } from '../components/context/AuthContext';
import BotanicalBackground from '../components/BotanicalBackground';

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    employeeCode: '',
    department: '',
    designation: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.employeeCode.trim()) newErrors.employeeCode = 'Employee code is required';
    if (!form.email.trim()) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Please enter a valid email';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    const result = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      employee_code: form.employeeCode.trim(),
      department: form.department.trim(),
      designation: form.designation.trim() || null,
    });

    if (result.success) {
      navigate('/login');
    } else {
      setApiError(result.error);
    }
  };

  return (
    <div className="auth-layout">
      <BotanicalBackground variant="auth" />

      <div className="auth-card" style={{ maxWidth: 490 }}>
        {/* Branding */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <GraduationCap size={24} />
          </div>

        </div>

        <h1 className="auth-title">SkillSync-AI</h1>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          textAlign: 'center',
          color: 'var(--text-cream)',
          fontFamily: 'var(--font-serif)',
          marginBottom: '0.35rem'
        }}>
          Create Your Account
        </h2>
        <p className="auth-subtitle">
          Join SkillSync-AI to chart your personalized learning path
        </p>

        {/* Error notification */}
        {apiError && (
          <div style={{
            background: 'var(--status-danger-bg)',
            color: '#fca5a5',
            padding: '0.8125rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.84375rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            border: '1px solid rgba(200, 90, 84, 0.3)'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name field */}
          <div className="form-group">
            <label className="form-label" htmlFor="name-input">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--accent-gold)',
                  pointerEvents: 'none'
                }}
              />
              <input
                id="name-input"
                type="text"
                className="form-input"
                style={{ paddingLeft: 42 }}
                placeholder="Eleanor Vance"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
              />
            </div>
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="employee-code-input">Employee Code</label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)', pointerEvents: 'none' }} />
              <input id="employee-code-input" type="text" className="form-input" style={{ paddingLeft: 42 }} placeholder="Your employee code" value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} autoComplete="off" />
            </div>
            {errors.employeeCode && <div className="form-error">{errors.employeeCode}</div>}
          </div>

          {/* Email field */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--accent-gold)',
                  pointerEvents: 'none'
                }}
              />
              <input
                id="reg-email"
                type="email"
                className="form-input"
                style={{ paddingLeft: 42 }}
                placeholder="you@organization.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </div>
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          {/* Department field */}
          <div className="form-group">
            <label className="form-label" htmlFor="department-input">Department / Specialization</label>
            <div style={{ position: 'relative' }}>
              <Briefcase
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--accent-gold)',
                  pointerEvents: 'none'
                }}
              />
              <input
                id="department-input"
                type="text"
                className="form-input"
                style={{ paddingLeft: 42 }}
                placeholder="e.g. Engineering, Data Science, Product"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>
          </div>


          {/* Password fields row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--accent-gold)',
                    pointerEvents: 'none'
                  }}
                />
                <input
                  id="reg-password"
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  placeholder="Min 6 chars"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
                />
              </div>
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password">Confirm</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--accent-gold)',
                    pointerEvents: 'none'
                  }}
                />
                <input
                  id="confirm-password"
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  placeholder="Repeat"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Register);
