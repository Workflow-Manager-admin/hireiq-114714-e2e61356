import React, { createContext, useContext, useState } from 'react';
import { supabase } from './supabaseClient';

// Demo users (legacy, for demo account fallback)
const demoUsers = [
  { username: 'admin', password: 'admin', role: 'Admin' },
  { username: 'recruiter', password: 'recruiter', role: 'Recruiter' },
  { username: 'candidate', password: 'candidate', role: 'Candidate' },
];

const AuthContext = createContext();

/**
 * PUBLIC_INTERFACE
 * Auth provider for role-based context and Supabase auth.
 */
function AuthProvider({ children }) {
  // user: { id, email, role, ... } or { username, role } for demo users
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('hireiq_user')) || null
  );

  /**
   * PUBLIC_INTERFACE
   * Login handler supporting both demo and Supabase email/password auth.
   * For demo: pass { username, password, demo: true }
   * For Supabase: pass { email, password }
   * Returns { success: true, role } or { success: false, error }
   */
  const login = async ({ email, password, username, demo }) => {
    if (demo) {
      // Legacy demo accounts, username/password (for test/demo)
      const matched = demoUsers.find(
        (u) => u.username === username && u.password === password
      );
      if (matched) {
        setUser(matched);
        localStorage.setItem('hireiq_user', JSON.stringify(matched));
        return { success: true, role: matched.role };
      }
      return { success: false, error: 'Invalid username or password' };
    }

    try {
      // Supabase auth with email/password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      if (!data.session || !data.user) {
        return { success: false, error: 'Invalid credentials or user session' };
      }

      // Get user metadata/role
      // Prefer custom 'role' field in user_metadata
      let userRole = data.user.user_metadata?.role || null;
      if (!userRole && data.user.role) userRole = data.user.role; // fallback if any

      // If profile table stores role, may need to fetch it here in future

      // Compose user object for app
      const userObj = {
        id: data.user.id,
        email: data.user.email,
        role: userRole || 'Candidate', // Default to Candidate if not set
      };
      setUser(userObj);
      localStorage.setItem('hireiq_user', JSON.stringify(userObj));
      return { success: true, role: userObj.role };
    } catch (e) {
      return { success: false, error: e.message || 'Login failed' };
    }
  };

  // PUBLIC_INTERFACE
  const logout = async () => {
    setUser(null);
    localStorage.removeItem('hireiq_user');
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * PUBLIC_INTERFACE
 * Custom hook to access auth context.
 */
function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;
export { useAuth };
