import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import './LoginPage.css';

/**
 * PUBLIC_INTERFACE
 * Login page for role-based authentication with Supabase support.
 */
function LoginPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    // fallback for demo mode
    username: '',
    loginMode: 'standard', // 'standard' (Supabase) | 'demo'
  });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const switchLoginMode = () => {
    setForm({ ...form, loginMode: form.loginMode === 'demo' ? 'standard' : 'demo', email: '', username: '', password: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPending(true);

    let result;
    if (form.loginMode === 'demo') {
      result = await login({ username: form.username, password: form.password, demo: true });
    } else {
      result = await login({ email: form.email, password: form.password });
    }
    setPending(false);

    if (result.success) {
      if (result.role === 'Admin') navigate('/admin');
      else if (result.role === 'Recruiter') navigate('/recruiter');
      else if (result.role === 'Candidate') navigate('/candidate');
      else navigate('/profile'); // fallback
    } else {
      setError(result.error || 'Invalid credentials, please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Hire<span className="accent">IQ</span> Login</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          {form.loginMode === 'demo' ? (
            <>
              <input
                name="username"
                type="text"
                placeholder="Demo Username"
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
            </>
          ) : (
            <>
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
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </>
          )}
          <button type="submit" className="login-btn" disabled={pending}>
            {pending ? "Logging in..." : "Login"}
          </button>
        </form>
        {error && <div className="login-error">{error}</div>}
        <div className="demo-note" style={{ marginTop: 14, marginBottom: 6 }}>
          {form.loginMode === "demo"
            ? <>Log in with <b>demo</b> accounts. <button type="button" style={{background:'none',border:0,color:'#0070f3',cursor:'pointer',textDecoration:'underline',fontSize:'0.99rem'}} onClick={switchLoginMode}>Use email login</button></>
            : <>Don't have an account? <Link to="/register">Sign up</Link> <br />
                <span style={{fontSize:'0.97rem',display:'block',marginTop:4}}>
                  Or <button type="button" style={{background:'none',border:0,color:'#0070f3',cursor:'pointer',textDecoration:'underline',fontSize:'0.99rem'}} onClick={switchLoginMode}>Use demo account</button>
                </span>
              </>
          }
        </div>
        {form.loginMode === 'demo' && (
          <div className="demo-note" style={{ fontSize: '0.94rem', background: '#eeeeeea8', color: '#216392' }}>
            <b>Demo accounts:</b><br />
            admin/admin &nbsp;•&nbsp; recruiter/recruiter &nbsp;•&nbsp; candidate/candidate
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
