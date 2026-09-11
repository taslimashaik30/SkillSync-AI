import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, GraduationCap, ArrowRight } from 'lucide-react';
import { useAuth } from '../components/context/AuthContext';
import BotanicalBackground from '../components/BotanicalBackground';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', role: 'employee' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Please enter a valid email';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    const result = await login(form.email, form.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setApiError(result.error);
    }
  };

  return (
    <div className="auth-layout">
      <BotanicalBackground variant="auth" />

      <div className="auth-card">
        {/* Branding Logo */}
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
          Welcome Back
        </h2>
        <p className="auth-subtitle">
          Sign in to access your personalized learning workspace
        </p>

        {/* API Error Notification */}
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
          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">Select Role</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-option ${form.role === 'employee' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'employee' })}
              >
                Learner
              </button>
              <button
                type="button"
                className={`role-option ${form.role === 'admin' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'admin' })}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Email field */}
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Email Address</label>
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
                id="email-input"
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

          {/* Password field */}
          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
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
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: 42, paddingRight: 42 }}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
            style={{ marginTop: '0.75rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Login);
