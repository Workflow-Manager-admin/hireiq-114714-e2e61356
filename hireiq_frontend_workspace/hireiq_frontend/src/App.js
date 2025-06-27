import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider, { useAuth } from './auth/AuthProvider';
import SideNav from './components/SideNav';
import TopHeader from './components/TopHeader';

import AdminDashboard from './pages/admin/AdminDashboard';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import JobManagement from './pages/recruiter/JobManagement';
import ApplicationManagement from './pages/recruiter/ApplicationManagement';
import InterviewScheduling from './pages/recruiter/InterviewScheduling';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import JobListings from './pages/candidate/JobListings';
import ApplicationTracking from './pages/candidate/ApplicationTracking';
import ResumeUpload from './pages/candidate/ResumeUpload';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterPage from './pages/RegisterPage';
import { Outlet } from 'react-router-dom';

import './App.css';

/**
 * Layout wrapper with sidebar and header (now expects an <Outlet /> for nested routes)
 */
function DashboardLayout({ availableRoutes }) {
  return (
    <div className="dashboard-layout">
      <SideNav routes={availableRoutes.sidebarRoutes} />
      <div className="dashboard-main">
        <TopHeader />
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Protected route component enforcing authentication and roles
 */
function ProtectedRoute({ allowedRoles, children }) {
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
        { label: 'Analytics', path: '/admin/analytics' },
        { label: 'Profile', path: '/profile' },
      ],
    },
    Recruiter: {
      sidebarRoutes: [
        { label: 'Dashboard', path: '/recruiter' },
        { label: 'Job Posts', path: '/recruiter/jobs' },
        { label: 'Applications', path: '/recruiter/applications' },
        { label: 'Interviews', path: '/recruiter/interviews' },
        { label: 'Profile', path: '/profile' },
      ],
    },
    Candidate: {
      sidebarRoutes: [
        { label: 'Dashboard', path: '/candidate' },
        { label: 'Job Listings', path: '/candidate/jobs' },
        { label: 'My Applications', path: '/candidate/applications' },
        { label: 'Upload Resume', path: '/candidate/resume' },
        { label: 'Profile', path: '/profile' },
      ],
    },
  };

  return (
    <AuthProvider>
      <Router>
        {/* Global background image overlay, always present */}
        <div className="app-bg" aria-hidden="true" />
        <button 
          className="theme-toggle"
          onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <DashboardLayout availableRoutes={roleRoutes.Admin} />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminDashboard section="users" />} />
            <Route path="jobs" element={<AdminDashboard section="jobs" />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
          </Route>

          {/* Recruiter Dashboard Routes */}
          <Route path="/recruiter" element={
            <ProtectedRoute allowedRoles={['Recruiter']}>
              <DashboardLayout availableRoutes={roleRoutes.Recruiter} />
            </ProtectedRoute>
          }>
            <Route index element={<RecruiterDashboard />} />
            <Route path="jobs" element={<JobManagement />} />
            <Route path="applications" element={<ApplicationManagement />} />
            <Route path="interviews" element={<InterviewScheduling />} />
          </Route>

          {/* Candidate Dashboard Routes */}
          <Route path="/candidate" element={
            <ProtectedRoute allowedRoles={['Candidate']}>
              <DashboardLayout availableRoutes={roleRoutes.Candidate} />
            </ProtectedRoute>
          }>
            <Route index element={<CandidateDashboard />} />
            <Route path="jobs" element={<JobListings />} />
            <Route path="applications" element={<ApplicationTracking />} />
            <Route path="resume" element={<ResumeUpload />} />
          </Route>

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
