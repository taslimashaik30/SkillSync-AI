import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Target, Sparkles, GraduationCap,
  UserCircle, Bot, LogOut, X, ShieldCheck, CheckSquare
} from 'lucide-react';
import { useAuth } from './context/AuthContext';

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  const learnerMainItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/courses', icon: BookOpen, label: 'Courses' },
    { to: '/skill-gap', icon: Target, label: 'Skill Gap' },
    { to: '/recommendations', icon: Sparkles, label: 'Recommendations' },
  ];

  const learnerTrackItems = [
    { to: '/learning-path', icon: GraduationCap, label: 'Learning Path' },
    { to: '/quiz', icon: CheckSquare, label: 'Assessments' },
    { to: '/assistant', icon: Bot, label: 'AI Assistant' },
  ];

  return (
    <>
      <div
        className={`sidebar-backdrop ${open ? 'show' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Sidebar navigation">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <GraduationCap size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-logo-text">SkillSync AI</div>
            <div className="sidebar-logo-sub">
              {isAdmin ? 'Admin Console' : 'Learning Platform'}
            </div>
          </div>
          <button
            className="modal-close hide-desktop"
            onClick={onClose}
            style={{ color: 'var(--text-muted)', display: open ? 'block' : 'none' }}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {isAdmin ? (
            <div className="sidebar-nav-group">
              <div className="sidebar-nav-group-title">Administration</div>
              <NavLink
                to="/admin"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <ShieldCheck size={18} />
                <span>Admin Overview</span>
              </NavLink>
              <NavLink
                to="/courses"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <BookOpen size={18} />
                <span>Course Catalog</span>
              </NavLink>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <LayoutDashboard size={18} />
                <span>Learner View</span>
              </NavLink>
            </div>
          ) : (
            <>
              <div className="sidebar-nav-group">
                <div className="sidebar-nav-group-title">Workspace</div>
                {learnerMainItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>

              <div className="sidebar-nav-group">
                <div className="sidebar-nav-group-title">Growth & AI</div>
                {learnerTrackItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </>
          )}

          <div className="sidebar-nav-group">
            <div className="sidebar-nav-group-title">Account</div>
            <NavLink
              to="/profile"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <UserCircle size={18} />
              <span>My Profile</span>
            </NavLink>
            {!isAdmin && user?.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <ShieldCheck size={18} />
                <span>Admin Portal</span>
              </NavLink>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-user-name" title={user?.name || 'User'}>
                {user?.name || 'User'}
              </div>
              <div className="sidebar-user-role">
                {user?.role === 'admin' ? 'Administrator' : 'Learner'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.375rem',
                borderRadius: 'var(--radius-sm)',
                transition: 'color 0.2s ease',
              }}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default React.memo(Sidebar);