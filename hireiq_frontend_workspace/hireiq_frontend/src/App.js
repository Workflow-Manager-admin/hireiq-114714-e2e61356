import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider, { useAuth } from './auth/AuthProvider';
import SideNav from './components/SideNav';
import TopHeader from './components/TopHeader';

import AdminDashboard from './pages/admin/AdminDashboard';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

import './App.css';

/**
 * Layout wrapper with sidebar and header
 */
function DashboardLayout({ children, availableRoutes }) {
  return (
    <div className="dashboard-layout">
      <SideNav routes={availableRoutes.sidebarRoutes} />
      <div className="dashboard-main">
        <TopHeader />
        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Protected route component enforcing authentication and roles
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/notfound" replace />;
  }

  return children;
}

/**
 * PUBLIC_INTERFACE
 * App component with top-level routing and theming
 */
function App() {
  const [theme, setTheme] = useState('light');

  // Change theme colors on document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sample sidebar routes per role
  const roleRoutes = {
    Admin: {
      sidebarRoutes: [
        { label: 'Dashboard', path: '/admin' },
        { label: 'User Management', path: '/admin/users' },
        { label: 'Job Posts', path: '/admin/jobs' },
        { label: 'Profile', path: '/profile' },
      ],
    },
    Recruiter: {
      sidebarRoutes: [
        { label: 'Dashboard', path: '/recruiter' },
        { label: 'Applications', path: '/recruiter/applications' },
        { label: 'Schedule Interviews', path: '/recruiter/interviews' },
        { label: 'Profile', path: '/profile' },
      ],
    },
    Candidate: {
      sidebarRoutes: [
        { label: 'Dashboard', path: '/candidate' },
        { label: 'Job Listings', path: '/candidate/jobs' },
        { label: 'My Applications', path: '/candidate/applications' },
        { label: 'Profile', path: '/profile' },
      ],
    },
  };

  return (
    <AuthProvider>
      <Router>
        <button 
          className="theme-toggle"
          onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {/* Admin */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <DashboardLayout availableRoutes={roleRoutes.Admin}>
                  <Routes>
                    <Route path="" element={<AdminDashboard />} />
                    <Route path="users" element={<AdminDashboard section="users" />} />
                    <Route path="jobs" element={<AdminDashboard section="jobs" />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          {/* Recruiter */}
          <Route
            path="/recruiter/*"
            element={
              <ProtectedRoute allowedRoles={['Recruiter']}>
                <DashboardLayout availableRoutes={roleRoutes.Recruiter}>
                  <Routes>
                    <Route path="" element={<RecruiterDashboard />} />
                    <Route path="applications" element={<RecruiterDashboard section="applications" />} />
                    <Route path="interviews" element={<RecruiterDashboard section="interviews" />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          {/* Candidate */}
          <Route
            path="/candidate/*"
            element={
              <ProtectedRoute allowedRoles={['Candidate']}>
                <DashboardLayout availableRoutes={roleRoutes.Candidate}>
                  <Routes>
                    <Route path="" element={<CandidateDashboard />} />
                    <Route path="jobs" element={<CandidateDashboard section="jobs" />} />
                    <Route path="applications" element={<CandidateDashboard section="applications" />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Recruiter', 'Candidate']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/notfound" element={<NotFoundPage />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
