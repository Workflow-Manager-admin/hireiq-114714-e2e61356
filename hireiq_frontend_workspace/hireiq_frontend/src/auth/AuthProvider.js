import React, { createContext, useContext, useState } from 'react';

// Demo users
const demoUsers = [
  { username: 'admin', password: 'admin', role: 'Admin' },
  { username: 'recruiter', password: 'recruiter', role: 'Recruiter' },
  { username: 'candidate', password: 'candidate', role: 'Candidate' },
];

const AuthContext = createContext();

/**
 * PUBLIC_INTERFACE
 * Auth provider for role-based context.
 */
function AuthProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('hireiq_user')) || null
  );

  // PUBLIC_INTERFACE
  const login = (username, password) => {
    const matched = demoUsers.find(
      u => u.username === username && u.password === password
    );
    if (matched) {
      setUser(matched);
      localStorage.setItem('hireiq_user', JSON.stringify(matched));
      return { success: true, role: matched.role };
    }
    return { success: false };
  };

  // PUBLIC_INTERFACE
  const logout = () => {
    setUser(null);
    localStorage.removeItem('hireiq_user');
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
