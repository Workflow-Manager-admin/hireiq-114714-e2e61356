import React from 'react';
import { useAuth } from '../auth/AuthProvider';

/**
 * PUBLIC_INTERFACE
 * Profile page for all roles.
 */
function ProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <h2>Profile</h2>
      <div>
        <p><b>Username:</b> {user?.username}</p>
        <p><b>Role:</b> {user?.role}</p>
        <p>Email and additional settings would appear here.</p>
      </div>
    </div>
  );
}

export default ProfilePage;
