import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

function getPasswordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 3);
}

const STRENGTH_LABELS = ['', 'Weak', 'Medium', 'Strong'];
const STRENGTH_COLORS = ['', 'weak', 'medium', 'strong'];

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass]   = useState(false);
  const [error,    setError]      = useState('');
  const [success,  setSuccess]    = useState('');
  const [loading,  setLoading]    = useState(false);
  const [shake,    setShake]      = useState(false);
  const navigate = useNavigate();

  const strength = getPasswordStrength(formData.password);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      triggerShake();
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await registerUser(formData);
      setSuccess('🎉 Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* ==== LEFT HERO PANEL ==== */}
      <div className="auth-hero">
        <div className="auth-hero-orb auth-hero-orb-1" />
        <div className="auth-hero-orb auth-hero-orb-2" />
        <div className="auth-hero-orb auth-hero-orb-3" />

        <div className="auth-hero-logo">
          <div className="auth-hero-logo-icon">💎</div>
          <span className="auth-hero-logo-name">NexaPay</span>
        </div>

        <h2 className="auth-hero-title">
          Your financial<br />journey <span>starts here</span>
        </h2>

        <p className="auth-hero-desc">
          Join thousands of users who trust NexaPay for fast, secure, and transparent banking.
        </p>

        <div className="auth-hero-features">
          <div className="auth-hero-feature">
            <div className="auth-hero-feature-icon">🚀</div>
            <div className="auth-hero-feature-text">
              <strong>Open in seconds</strong> — no paperwork needed
            </div>
          </div>
          <div className="auth-hero-feature">
            <div className="auth-hero-feature-icon">💳</div>
            <div className="auth-hero-feature-text">
              <strong>Multiple accounts</strong> in INR, USD, or EUR
            </div>
          </div>
          <div className="auth-hero-feature">
            <div className="auth-hero-feature-icon">📧</div>
            <div className="auth-hero-feature-text">
              <strong>Email notifications</strong> for every transaction
            </div>
          </div>
          <div className="auth-hero-feature">
            <div className="auth-hero-feature-icon">🛡️</div>
            <div className="auth-hero-feature-text">
              <strong>Double-entry ledger</strong> ensures 100% accuracy
            </div>
          </div>
        </div>
      </div>

      {/* ==== RIGHT FORM PANEL ==== */}
      <div className="auth-form-panel">
        <div className={`auth-form-card${shake ? ' shake' : ''}`}>
          <h1>Create account</h1>
          <p className="auth-subtitle">Start your banking journey with NexaPay today</p>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success">
              <span className="alert-icon">✅</span>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="reg-name">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  className="has-icon"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="reg-email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className="has-icon"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔑</span>
                <input
                  id="reg-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  className="has-icon has-icon-right"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  minLength={6}
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

              {/* Password Strength Meter */}
              {formData.password && (
                <>
                  <div className="password-strength" style={{ marginTop: '8px' }}>
                    {[1, 2, 3].map((lvl) => (
                      <div
                        key={lvl}
                        className={`strength-bar${lvl <= strength ? ` ${STRENGTH_COLORS[strength]}` : ''}`}
                      />
                    ))}
                  </div>
                  <div className="strength-label">
                    Password strength: <strong>{STRENGTH_LABELS[strength]}</strong>
                  </div>
                </>
              )}
            </div>

            <button
              id="register-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: '8px' }}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                  Creating account...
                </>
              ) : (
                '🚀 Create Account'
              )}
            </button>
          </form>

          <p className="auth-link">
            Already have an account?{' '}
            <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
