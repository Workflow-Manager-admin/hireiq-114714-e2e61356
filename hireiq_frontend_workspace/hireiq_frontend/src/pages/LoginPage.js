import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import "./LoginPage.css";

/**
 * PUBLIC_INTERFACE
 * Login page for role-based authentication with Supabase support.
 * Modern, engaging layout with strong branding, clear feedback, and demo/register links.
 */
function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    // demo mode fallback
    username: "",
    loginMode: "standard", // 'standard' (Supabase) | 'demo'
  });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Success message (for demo)
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const switchLoginMode = () => {
    setForm({
      ...form,
      loginMode: form.loginMode === "demo" ? "standard" : "demo",
      email: "",
      username: "",
      password: "",
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setPending(true);

    let result;
    if (form.loginMode === "demo") {
      result = await login({ username: form.username, password: form.password, demo: true });
    } else {
      result = await login({ email: form.email, password: form.password });
    }
    setPending(false);

    if (result.success) {
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => {
        if (result.role === "Admin") navigate("/admin");
        else if (result.role === "Recruiter") navigate("/recruiter");
        else if (result.role === "Candidate") navigate("/candidate");
        else navigate("/profile");
      }, 800);
    } else {
      setError(result.error || "Invalid credentials, please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" role="main" aria-label="Login form area">
        <div className="brand-badge" aria-hidden="true">
          <div className="brand-logo" aria-hidden="true">
            <svg width="36" height="38" viewBox="0 0 36 38" fill="none" style={{verticalAlign:'middle',marginRight:0}}>
              <circle cx="18" cy="19" r="17.6" fill="#284DD9" stroke="#e8eaf4" strokeWidth="0.8"/>
              <text x="50%" y="61%" textAnchor="middle" fill="#fff" fontFamily="Inter,Sans-serif" fontSize="19" fontWeight="bold" dy=".18em" dx=".07em">IQ</text>
            </svg>
          </div>
          <span className="brand-title">
            Hire<span className="accent">IQ</span>
          </span>
        </div>
        <h2>
          <span style={{fontWeight:900}}>Sign in to</span> <span className="accent">HireIQ</span>
        </h2>
        <form onSubmit={handleSubmit} autoComplete="off" aria-label="Login form">
          {form.loginMode === "demo" ? (
            <>
              <div className="input-group">
                <span className="input-icon" aria-hidden="true">
                  <svg width="19" height="19" fill="none"><path stroke="#284DD9" strokeWidth="1.6" d="M3.4 15V14c0-2 3.2-3 5.1-3 2.1 0 5.1 1 5.1 3v1M9.5 8.2a3.2 3.2 0 100-6.3 3.2 3.2 0 000 6.3z"/></svg>
                </span>
                <input
                  id="demo-username"
                  name="username"
                  type="text"
                  placeholder="Demo Username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  autoFocus
                  aria-label="Demo Username"
                  aria-describedby="demouser-help"
                  autoComplete="username"
                />
              </div>
              <div className="input-group">
                <span className="input-icon" aria-hidden="true">
                  <svg width="18" height="18" fill="none"><rect x="2" y="7" width="14" height="8" rx="3" stroke="#284DD9" strokeWidth="1.6"/><circle cx="9" cy="11" r="2.2" stroke="#284DD9" strokeWidth="1.1"/></svg>
                </span>
                <input
                  id="demo-password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  aria-label="Demo Password"
                  autoComplete="current-password"
                />
              </div>
            </>
          ) : (
            <>
              <div className="input-group">
                <span className="input-icon" aria-hidden="true">
                  <svg width="20" height="20" fill="none"><path stroke="#284DD9" strokeWidth="1.5" d="M2.8 5.7l6.8 5.2c.51.39 1.19.39 1.7 0l5.88-4.49M3.58 3h12.7A1.7 1.7 0 0118 4.7v10.6A1.7 1.7 0 0116.28 17H3.7A1.7 1.7 0 012 15.3V4.7A1.7 1.7 0 013.7 3z"/></svg>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoFocus
                  aria-label="Email"
                  autoComplete="email"
                />
              </div>
              <div className="input-group">
                <span className="input-icon" aria-hidden="true">
                  <svg width="17" height="17" fill="none"><rect x="2.5" y="6" width="12" height="7" rx="2.7" stroke="#284DD9" strokeWidth="1.5"/><circle cx="8.5" cy="10" r="1.8" stroke="#284DD9" strokeWidth="1.05"/></svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  aria-label="Password"
                  autoComplete="current-password"
                />
              </div>
            </>
          )}
          <button
            type="submit"
            className="login-btn"
            disabled={pending}
            aria-busy={pending}
            aria-label="Login"
          >
            {pending ? "Logging in..." : "Login"}
          </button>
        </form>
        {error && <div className="login-error" role="alert">{error}</div>}
        {success && <div className="login-success" role="status">{success}</div>}

        <div className="demo-note" style={{ marginTop: 15, marginBottom: 4 }}>
          {form.loginMode === "demo" ? (
            <>
              Log in with <b>demo</b> accounts.
              <span className="or-divider" style={{margin:"16px 0 3px 0"}}>
                <span>or</span>
              </span>
              <button
                type="button"
                style={{
                  fontWeight:700, 
                  color: "#284DD9", 
                  background: "none",
                  border: 0,
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "1.08rem"
                }}
                onClick={switchLoginMode}
                aria-label="Switch to email login"
              >
                Use email login
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?
              <Link
                className="register-link"
                to="/register"
                aria-label="Sign up"
                style={{fontWeight:700}}
              >
                Sign up
              </Link>
              <span style={{display:'block',marginTop:7}}>
                <span className="or-divider" style={{margin:'12px 0'}}>
                  <span>or</span>
                </span>
                <button
                  type="button"
                  onClick={switchLoginMode}
                  style={{
                    fontWeight:700, 
                    color: "#284DD9", 
                    background: "none",
                    border: 0,
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "1.08rem"
                  }}
                  aria-label="Use demo account"
                >
                  Use demo account
                </button>
              </span>
            </>
          )}
        </div>
        {form.loginMode === "demo" && (
          <div className="demo-accounts-list" aria-live="polite" aria-label="Demo accounts">
            <b>Demo accounts:</b>
            <br />
            admin/admin &nbsp;•&nbsp; recruiter/recruiter &nbsp;•&nbsp; candidate/candidate
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
