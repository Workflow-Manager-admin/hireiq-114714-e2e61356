import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Admin dashboard for user/job post management.
 */
function AdminDashboard({ section }) {
  return (
    <div>
      <h2>Welcome, Admin!</h2>
      {(!section || section === "") && (
        <div>
          <p>This is your dashboard. You can:</p>
          <ul>
            <li>Manage users (activate/deactivate roles)</li>
            <li>Create/edit job posts</li>
            <li>View app analytics</li>
          </ul>
        </div>
      )}
      {section === "users" && (
        <div>
          <h3>User Management</h3>
          <p>See all users and manage their roles here.</p>
        </div>
      )}
      {section === "jobs" && (
        <div>
          <h3>Job Post Management</h3>
          <p>Create and manage open job posts here.</p>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
