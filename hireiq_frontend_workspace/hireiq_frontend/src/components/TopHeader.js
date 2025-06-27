import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import './TopHeader.css';

/**
 * PUBLIC_INTERFACE
 * Minimal top header bar with user info and logout action for all authenticated users/roles.
 * Displays user info and provides a logout button that clears context, session, and resets app state.
 */
function TopHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // PUBLIC_INTERFACE
  // Logout handler: calls AuthProvider.logout, clears context/localStorage/session, redirects to /login and resets navigation state.
  const handleLogout = async () => {
    try {
      await logout();
      // Additional state cleanup (defensive): clear user/hireiq_user in localStorage.
      window.localStorage.removeItem('hireiq_user');
      // Remove possible session storage as well (if used in newer features).
      window.sessionStorage && window.sessionStorage.clear();
      // Always navigate to /login, replacing history so back doesn't go to an authed route.
      navigate('/login', { replace: true });
      // Optionally, you could reload for full cleanup (not required for SPA if proper context and storage cleared).
    } catch (err) {
      // Optionally, display error or fallback to login page regardless.
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="topheader">
      <div className="topheader-left">
        <span className="topheader-title">Dashboard</span>
      </div>
      <div className="topheader-right">
        <div className="user-info">
          <span>{user?.email || user?.username}</span>
          <span className="user-role">{user?.role}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout} aria-label="Logout">
          Logout
        </button>
      </div>
    </header>
  );
}

export default TopHeader;
