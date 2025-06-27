import React from 'react';
import { useAuth } from '../auth/AuthProvider';

/**
 * PUBLIC_INTERFACE
 * Profile page for all roles (Supabase/email and demo supported).
 */
function ProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <h2>Profile</h2>
      <div>
        {user?.email && <p><b>Email:</b> {user.email}</p>}
        {user?.username && <p><b>Username:</b> {user.username}</p>}
        <p><b>Role:</b> {user?.role}</p>
      </div>
    </div>
  );
}

export default ProfilePage;
