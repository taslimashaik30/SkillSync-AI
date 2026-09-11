import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, User, Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from './context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <nav className="landing-nav">
      <div className="landing-nav-inner">
        <Link to="/" className="landing-brand" aria-label="SkillSync-AI home">
          <div className="landing-brand-mark">
            <GraduationCap size={20} />
          </div>
          <span>
            SkillSync<span style={{ color: 'var(--accent-gold)' }}>-AI</span>
          </span>
        </Link>

        <div className="landing-nav-links">
          <a href="/#features" className="landing-nav-link">Features</a>
          <a href="/#about" className="landing-nav-link">About</a>
          {isAuthenticated ? (
            <>
              <Link to={isAdmin ? '/admin' : '/dashboard'} className="landing-nav-link">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                style={{ marginLeft: '0.5rem' }}
              >
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="landing-nav-link">Login</Link>
              <Link to="/register" className="landing-nav-cta">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          className="topbar-menu-btn hide-desktop"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{
          background: 'rgba(16, 38, 30, 0.98)',
          borderBottom: '1px solid var(--border-gold)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 100,
          boxShadow: 'var(--shadow-xl)'
        }}>
          <a href="/#features" className="landing-nav-link" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="/#about" className="landing-nav-link" onClick={() => setMobileOpen(false)}>About</a>
          {isAuthenticated ? (
            <>
              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                className="landing-nav-link"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                className="btn btn-outline btn-sm"
                style={{ alignSelf: 'flex-start' }}
              >
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default React.memo(Navbar);