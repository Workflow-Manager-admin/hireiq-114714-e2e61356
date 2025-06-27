import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import './TopHeader.css';

/**
 * PUBLIC_INTERFACE
 * Minimal top header bar with user info and actions.
 */
function TopHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="topheader">
      <div className="topheader-left">
        <span className="topheader-title">Dashboard</span>
      </div>
      <div className="topheader-right">
        <div className="user-info">
          <span>{user?.username}</span>
          <span className="user-role">{user?.role}</span>
        </div>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default TopHeader;
