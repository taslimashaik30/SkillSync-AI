import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/context/AuthContext';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';
import BotanicalBackground from './components/BotanicalBackground';

import Login from './Pages/Login';
import Register from './Pages/Register';
import Dashboard from './Pages/Dashboard';
import Welcome from './Pages/Welcome';
import Courses from './Pages/Courses';
import CourseDetails from './Pages/CourseDetails';
import SkillGap from './Pages/SkillGap';
import Recommendations from './Pages/Recommendations';
import LearningPath from './Pages/LearningPath';
import Quiz from './Pages/Quiz';
import Profile from './Pages/Profile';
import Assistant from './Pages/Assistant';
import AdminDashboard from './Pages/AdminDashboard';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authLoading } = useAuth();

  if (authLoading) {
    return <div className="loading-state"><div className="spinner" /></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const roleClass = user?.role === 'admin' ? 'role-admin' : 'role-learner';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Learner';
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className={`dashboard-layout ${roleClass}`}>
      <BotanicalBackground variant="dashboard" />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="dashboard-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="topbar-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open Sidebar Menu"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div style={{
              fontWeight: 700,
              fontSize: '1.0625rem',
              fontFamily: 'var(--font-serif)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              SkillSync<span style={{ color: 'var(--accent-wine)' }}>-AI</span>
            </div>
          </div>

          <div className="topbar-right">
            <button
              className="topbar-icon-btn"
              title="Notifications"
              aria-label="Notifications"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="topbar-notification-dot" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 6 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 0 }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {firstName}
                </span>
                <Link to="/profile" style={{ fontSize: '0.71875rem', color: 'var(--accent-wine)' }}>
                  Profile
                </Link>
              </div>
              <Link to="/profile" style={{ display: 'block' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-terracotta))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2b0f20',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  boxShadow: '0 2px 8px rgba(50, 15, 30, 0.12)',
                  border: '1px solid var(--border-gold)'
                }}>
                  {initial}
                </div>
              </Link>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC WELCOME */}
      <Route path="/" element={<Welcome />} />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* STUDENT DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* COURSES */}
      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Courses />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CourseDetails />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* SKILL GAP */}
      <Route
        path="/skill-gap"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SkillGap />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* RECOMMENDATIONS */}
      <Route
        path="/recommendations"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Recommendations />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* LEARNING PATH */}
      <Route
        path="/learning-path"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <LearningPath />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* QUIZ */}
      <Route
        path="/quiz"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Quiz />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* AI ASSISTANT */}
      <Route
        path="/assistant"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Assistant />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* PROFILE */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
      <Chatbot />
    </AuthProvider>
  );
};

export default App;
