import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getDashboardPath } from '../api';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();

    if (!email || !form.password) {
      setMessage('Enter your email and password to continue.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password: form.password });
      login(res.data.token, res.data.user);
      navigate(getDashboardPath(res.data.user?.role), { replace: true });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <section className="auth-panel">
        <div className="auth-copy">
          <p className="auth-kicker">Talent marketplace</p>
          <h1>Sign in and keep your hiring work moving.</h1>
          <p>
            Job seekers can track applications, while employers can post roles and manage applicants from one place.
          </p>
          <div className="auth-highlights">
            <span>Application tracking</span>
            <span>Employer dashboard</span>
            <span>Secure sessions</span>
          </div>
        </div>

        <div className="auth-box">
          <div className="auth-heading">
            <h2>Welcome back</h2>
            <p>Use the account you created for this portal.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              Email address
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <div className="form-row-between">
              <label className="remember-check">
                <input type="checkbox" defaultChecked />
                Keep me signed in
              </label>
              <Link to="/register">Create account</Link>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {message && <p className="error-msg">{message}</p>}

          <div className="demo-note">
            <strong>New here?</strong>
            <span>Register as a job seeker or employer, then sign in with the same details.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
