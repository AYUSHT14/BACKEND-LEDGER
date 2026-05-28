import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email,     setEmail]    = useState('');
  const [password,  setPassword] = useState('');
  const [showPass,  setShowPass] = useState(false);
  const [error,     setError]    = useState('');
  const [loading,   setLoading]  = useState(false);
  const [shake,     setShake]    = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      const { user, token } = res.data;
      login({ ...user, token });
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* ====  LEFT HERO PANEL ==== */}
      <div className="auth-hero">
        <div className="auth-hero-orb auth-hero-orb-1" />
        <div className="auth-hero-orb auth-hero-orb-2" />
        <div className="auth-hero-orb auth-hero-orb-3" />

        <div className="auth-hero-logo">
          <div className="auth-hero-logo-icon">💎</div>
          <span className="auth-hero-logo-name">NexaPay</span>
        </div>

        <h2 className="auth-hero-title">
          Banking that<br />works <span>for you</span>
        </h2>

        <p className="auth-hero-desc">
          Send money instantly, track every transaction, and manage multiple accounts — all in one beautiful interface.
        </p>

        <div className="auth-hero-features">
          <div className="auth-hero-feature">
            <div className="auth-hero-feature-icon">⚡</div>
            <div className="auth-hero-feature-text">
              <strong>Instant transfers</strong> with ledger-based accuracy
            </div>
          </div>
          <div className="auth-hero-feature">
            <div className="auth-hero-feature-icon">🔒</div>
            <div className="auth-hero-feature-text">
              <strong>Bank-grade security</strong> with JWT + idempotency keys
            </div>
          </div>
          <div className="auth-hero-feature">
            <div className="auth-hero-feature-icon">📊</div>
            <div className="auth-hero-feature-text">
              <strong>Full transaction history</strong> for every account
            </div>
          </div>
          <div className="auth-hero-feature">
            <div className="auth-hero-feature-icon">🌍</div>
            <div className="auth-hero-feature-text">
              <strong>Multi-currency</strong> support (INR, USD, EUR)
            </div>
          </div>
        </div>
      </div>

      {/* ==== RIGHT FORM PANEL ==== */}
      <div className="auth-form-panel">
        <div className={`auth-form-card${shake ? ' shake' : ''}`}>
          <h1>Welcome back</h1>
          <p className="auth-subtitle">Sign in to your NexaPay account to continue</p>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  id="login-email"
                  type="email"
                  className="has-icon"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔑</span>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="has-icon has-icon-right"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: '8px' }}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                  Signing in...
                </>
              ) : (
                '🔓 Sign In'
              )}
            </button>
          </form>

          <p className="auth-link">
            Don't have an account?{' '}
            <Link to="/register">Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
