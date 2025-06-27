import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import './LoginPage.css';

/**
 * PUBLIC_INTERFACE
 * Login page for role-based demo authentication.
 */
function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const res = login(form.username, form.password);
    if (res.success) {
      if (res.role === 'Admin') navigate('/admin');
      else if (res.role === 'Recruiter') navigate('/recruiter');
      else if (res.role === 'Candidate') navigate('/candidate');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Hire<span className="accent">IQ</span> Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            autoFocus
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
        {error && <div className="login-error">{error}</div>}
        <div className="demo-note" style={{ marginTop: 14, marginBottom: 6 }}>
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
        <div className="demo-note" style={{ fontSize: '0.94rem', background: '#eeeeeea8', color: '#216392' }}>
          <b>Demo accounts:</b><br />
          admin/admin &nbsp;•&nbsp; recruiter/recruiter &nbsp;•&nbsp; candidate/candidate
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
