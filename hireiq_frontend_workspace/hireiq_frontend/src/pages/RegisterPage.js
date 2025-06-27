import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../auth/supabaseClient';
import './LoginPage.css';

/**
 * PUBLIC_INTERFACE
 * Registration page using Supabase authentication.
 */
function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', role: 'Candidate' });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // PUBLIC_INTERFACE
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPending(true);

    // Supabase signup
    const { email, password, role } = form;
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
      },
    });

    setPending(false);
    if (signUpError) {
      setError(signUpError.message);
    } else if (data.user) {
      setSuccess(
        'Registration successful! Please check your email to confirm your account before logging in.'
      );
      // Optionally redirect to login after delay
      setTimeout(() => {
        navigate('/login');
      }, 3500);
    } else {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>
          Hire<span className="accent">IQ</span> Sign Up
        </h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            autoFocus
          />
          <input
            name="password"
            type="password"
            placeholder="Password (min 6 chars)"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
          />
          <select name="role" value={form.role} onChange={handleChange} style={{ marginBottom: 18, padding: '10px 9px', borderRadius: 6 }}>
            <option value="Candidate">Candidate</option>
            <option value="Recruiter">Recruiter</option>
            <option value="Admin">Admin</option>
          </select>
          <button type="submit" className="login-btn" disabled={pending}>
            {pending ? "Registering..." : "Register"}
          </button>
        </form>
        {success && <div className="demo-note" style={{ background: '#47bf6b12', color: '#166f47' }}>{success}</div>}
        {error && <div className="login-error">{error}</div>}
        <div className="demo-note" style={{ marginTop: 16 }}>
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
