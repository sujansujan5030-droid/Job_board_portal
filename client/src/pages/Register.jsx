import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'jobseeker',
    companyName: '',
    phone: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const passwordScore = useMemo(() => {
    let score = 0;
    if (form.password.length >= 8) score += 1;
    if (/[A-Z]/.test(form.password)) score += 1;
    if (/[0-9]/.test(form.password)) score += 1;
    if (/[^A-Za-z0-9]/.test(form.password)) score += 1;
    return score;
  }, [form.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage('');
  };

  const validateForm = () => {
    if (form.name.trim().length < 2) return 'Enter your full name.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    if (form.role === 'employer' && !form.companyName.trim()) return 'Company name is required for employers.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        companyName: form.companyName.trim(),
        phone: form.phone.trim()
      });

      login(res.data.token, res.data.user);
      navigate('/', { replace: true });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <section className="auth-panel">
        <div className="auth-copy">
          <p className="auth-kicker">Build your workspace</p>
          <h1>Create a profile that matches how you use the portal.</h1>
          <p>
            Job seekers get application tracking. Employers get job posting, applicant review, and company tools.
          </p>
          <div className="role-preview">
            <button
              type="button"
              className={form.role === 'jobseeker' ? 'selected' : ''}
              onClick={() => setForm((prev) => ({ ...prev, role: 'jobseeker' }))}
            >
              Job seeker
            </button>
            <button
              type="button"
              className={form.role === 'employer' ? 'selected' : ''}
              onClick={() => setForm((prev) => ({ ...prev, role: 'employer' }))}
            >
              Employer
            </button>
          </div>
        </div>

        <div className="auth-box auth-box-wide">
          <div className="auth-heading">
            <h2>Create account</h2>
            <p>All fields marked with an asterisk are required.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-grid">
              <label>
                Full name *
                <input
                  type="text"
                  name="name"
                  placeholder="Aarav Sharma"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                Email address *
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
            </div>

            <div className="form-grid">
              <label>
                Phone
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </label>

              <label>
                Account type *
                <select name="role" value={form.role} onChange={handleChange} className="role-select">
                  <option value="jobseeker">Job seeker</option>
                  <option value="employer">Employer / recruiter</option>
                </select>
              </label>
            </div>

            {form.role === 'employer' && (
              <label>
                Company name *
                <input
                  type="text"
                  name="companyName"
                  placeholder="Acme Technologies"
                  value={form.companyName}
                  onChange={handleChange}
                  required
                />
              </label>
            )}

            <div className="form-grid">
              <label>
                Password *
                <div className="password-field">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword((value) => !value)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              <label>
                Confirm password *
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </label>
            </div>

            <div className="password-meter" aria-label="Password strength">
              <span className={passwordScore >= 1 ? 'filled' : ''} />
              <span className={passwordScore >= 2 ? 'filled' : ''} />
              <span className={passwordScore >= 3 ? 'filled' : ''} />
              <span className={passwordScore >= 4 ? 'filled' : ''} />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {message && <p className="error-msg">{message}</p>}
          <p className="auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
