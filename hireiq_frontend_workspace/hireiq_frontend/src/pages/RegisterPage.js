import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../auth/supabaseClient';
import './LoginPage.css';
// No extra CSS imported; Register and LoginPage share styles for consistency.

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
      <div className="login-card" style={{maxWidth:420}}>
        <h2 style={{letterSpacing:'0.6px'}}>
          <span className="accent" style={{fontWeight:900}}>Create your account</span>
        </h2>
        <form onSubmit={handleSubmit} autoComplete="off" style={{marginTop:18, display:'flex', flexDirection:'column', gap:0}}>
          <input
            name="email"
            type="email"
            placeholder="Work email"
            value={form.email}
            onChange={handleChange}
            required
            autoFocus
            style={{marginBottom:12}}
          />
          <input
            name="password"
            type="password"
            placeholder="Password (min 6 chars)"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
            style={{marginBottom:12}}
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={{
              marginBottom:18,
              padding:'10px 9px',
              borderRadius: 6,
              background:'#f8f9fa',
              border: '1px solid #eee',
              fontWeight:500
            }}
          >
            <option value="Candidate">Candidate</option>
            <option value="Recruiter">Recruiter</option>
            <option value="Admin">Admin</option>
          </select>
          <button type="submit" className="login-btn" disabled={pending} style={{marginBottom:8}}>
            {pending ? "Registering..." : "Register"}
          </button>
        </form>
        {success && <div className="demo-note" style={{ background: '#e3fcec', color: '#145b39', fontWeight:600, border:'1px solid #4ad47c44', marginBottom:8 }}>{success}</div>}
        {error && <div className="login-error">{error}</div>}
        <div className="demo-note" style={{ marginTop: 13, fontSize:'1rem'}}>
          Already have an account? <Link style={{color:'#0070f3',textDecoration:'underline',fontWeight:600}} to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
