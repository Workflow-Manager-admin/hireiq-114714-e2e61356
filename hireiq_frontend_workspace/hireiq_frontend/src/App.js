import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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

import './App.css';

// --- Loading/Fallback Components ---
function FallbackSpinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "50vh" }}>
      <div style={{
        border: '6px solid #eaeaea',
        borderTop: '6px solid #284DD9',
        borderRadius: '50%',
        width: 44,
        height: 44,
        animation: 'spin 1s linear infinite',
        marginBottom: 15
      }} />
      <span style={{ color: "#284DD9", fontWeight: 600 }}>Loading...</span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </div>
  );
}

// --- LAYOUT COMPONENTS with OUTLET ---
function DashboardShell({ sidebarRoutes = [] }) {
  // This layout is reused for all dashboards
  return (
    <div className="dashboard-layout">
      <SideNav routes={sidebarRoutes} />
      <div className="dashboard-main">
        <TopHeader />
        <div className="dashboard-content">
          <Suspense fallback={<FallbackSpinner />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// --- ROUTE DEFINITIONS ---
const roleSidebarRoutes = {
  Admin: [
    { label: 'Dashboard', path: '/admin' },
    { label: 'User Management', path: '/admin/users' },
    { label: 'Job Posts', path: '/admin/jobs' },
    { label: 'Analytics', path: '/admin/analytics' },
    { label: 'Profile', path: '/profile' }
  ],
  Recruiter: [
    { label: 'Dashboard', path: '/recruiter' },
    { label: 'Job Posts', path: '/recruiter/jobs' },
    { label: 'Applications', path: '/recruiter/applications' },
    { label: 'Interviews', path: '/recruiter/interviews' },
    { label: 'Profile', path: '/profile' }
  ],
  Candidate: [
    { label: 'Dashboard', path: '/candidate' },
    { label: 'Job Listings', path: '/candidate/jobs' },
    { label: 'My Applications', path: '/candidate/applications' },
    { label: 'Upload Resume', path: '/candidate/resume' },
    { label: 'Profile', path: '/profile' }
  ]
};

// --- PROTECTED ROUTE COMPONENT ---
/**
 * PUBLIC_INTERFACE
 * Protects the route by requiring authentication and specified roles.
 */
function ProtectedRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!user) {
    return <FallbackSpinner />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/notfound" replace />;
  }
  return children;
}

// --- MAIN APP COMPONENT ---
/**
 * PUBLIC_INTERFACE
 * App component with routing, theming, and dashboard/layout logic.
 */
function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <AuthProvider>
      <Router>
        {/* Always-present global background gradient image */}
        <div className="app-bg" aria-hidden="true"/>
        <button 
          className="theme-toggle"
          onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <Suspense fallback={<FallbackSpinner />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* ADMIN DASHBOARD & CHILD ROUTES */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <DashboardShell sidebarRoutes={roleSidebarRoutes.Admin} />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminDashboard section="users" />} />
              <Route path="jobs" element={<AdminDashboard section="jobs" />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
            </Route>

            {/* RECRUITER DASHBOARD & CHILD ROUTES */}
            <Route path="/recruiter" element={
              <ProtectedRoute allowedRoles={['Recruiter']}>
                <DashboardShell sidebarRoutes={roleSidebarRoutes.Recruiter} />
              </ProtectedRoute>
            }>
              <Route index element={<RecruiterDashboard />} />
              <Route path="jobs" element={<JobManagement />} />
              <Route path="applications" element={<ApplicationManagement />} />
              <Route path="interviews" element={<InterviewScheduling />} />
            </Route>

            {/* CANDIDATE DASHBOARD & CHILD ROUTES */}
            <Route path="/candidate" element={
              <ProtectedRoute allowedRoles={['Candidate']}>
                <DashboardShell sidebarRoutes={roleSidebarRoutes.Candidate} />
              </ProtectedRoute>
            }>
              <Route index element={<CandidateDashboard />} />
              <Route path="jobs" element={<JobListings />} />
              <Route path="applications" element={<ApplicationTracking />} />
              <Route path="resume" element={<ResumeUpload />} />
            </Route>

            {/* Profile (protected for all roles) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Recruiter', 'Candidate']}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Not Found fallback and root redirection */}
            <Route path="/notfound" element={<NotFoundPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
