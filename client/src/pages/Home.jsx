import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getDashboardPath } from '../api';
import { useAuth } from '../context/AuthContext';
import '../styles/home.css';

const categories = [
  { title: 'Engineering', count: '1,240 roles', detail: 'Frontend, backend, mobile, DevOps' },
  { title: 'Product', count: '430 roles', detail: 'Product management, analytics, design' },
  { title: 'Sales', count: '890 roles', detail: 'Inside sales, enterprise, customer success' },
  { title: 'Operations', count: '520 roles', detail: 'HR, finance, support, business ops' }
];

const hiringTools = [
  'Role-based employer dashboard',
  'Applicant tracking and shortlisting',
  'Protected job posting workflow',
  'Company profile and hiring pipeline'
];

export default function Home() {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const res = await api.get('/jobs');
        setFeaturedJobs(res.data.slice(0, 3));
      } catch {
        setFeaturedJobs([]);
      }
    };

    fetchFeaturedJobs();
  }, []);

  const dashboardPath = useMemo(() => getDashboardPath(user?.role), [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (location.trim()) params.set('location', location.trim());
    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="home-container">
      <section className="home-hero">
        <div className="home-hero-content">
          <p className="hero-kicker">Modern job marketplace</p>
          <h1>Hire faster. Apply smarter. Track everything in one place.</h1>
          <p className="hero-copy">
            A production-style job board for candidates, employers, and admins with secure accounts, job posting,
            application tracking, and role-based dashboards.
          </p>

          <form className="hero-search" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Job title, keyword, or company"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <input
              type="search"
              placeholder="City or remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <button type="submit">Search Jobs</button>
          </form>

          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => navigate('/jobs')}>
              Browse Jobs
            </button>
            <button className="btn btn-secondary" onClick={() => navigate(user ? dashboardPath : '/register')}>
              {user ? 'Open Dashboard' : 'Create Account'}
            </button>
          </div>
        </div>

        <div className="hero-insight">
          <div className="insight-header">
            <span>Live hiring snapshot</span>
            <strong>{featuredJobs.length || 0} featured</strong>
          </div>
          <div className="insight-list">
            {featuredJobs.length > 0 ? (
              featuredJobs.map((job) => (
                <button key={job._id} onClick={() => navigate('/jobs')} className="insight-job">
                  <span>{job.title}</span>
                  <small>{job.company} - {job.location}</small>
                </button>
              ))
            ) : (
              <div className="insight-empty">
                <strong>Post your first job</strong>
                <small>Employer roles will appear here as soon as they are created.</small>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="home-stats" aria-label="Platform metrics">
        <div>
          <strong>50K+</strong>
          <span>candidate profiles</span>
        </div>
        <div>
          <strong>5K+</strong>
          <span>verified companies</span>
        </div>
        <div>
          <strong>24h</strong>
          <span>average first response</span>
        </div>
        <div>
          <strong>92%</strong>
          <span>roles with transparent status</span>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <p>Browse by team</p>
          <h2>Find work by role, function, and location.</h2>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <button key={category.title} className="category-card" onClick={() => navigate('/jobs')}>
              <span>{category.title}</span>
              <strong>{category.count}</strong>
              <small>{category.detail}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="split-section">
        <div>
          <p className="section-kicker">For job seekers</p>
          <h2>Applications are easier when your next step is always visible.</h2>
          <p>
            Create a profile, apply to active roles, and track application status from your dashboard. The portal keeps
            your search organized so you can focus on stronger applications.
          </p>
          <button className="btn btn-dark" onClick={() => navigate(user ? '/dashboard' : '/register')}>
            Start Applying
          </button>
        </div>
        <div className="process-list">
          <div>
            <strong>1</strong>
            <span>Create profile</span>
          </div>
          <div>
            <strong>2</strong>
            <span>Apply to roles</span>
          </div>
          <div>
            <strong>3</strong>
            <span>Track decisions</span>
          </div>
        </div>
      </section>

      <section className="employer-section">
        <div className="section-heading">
          <p>For employers</p>
          <h2>Post jobs and manage hiring with the tools teams expect.</h2>
        </div>
        <div className="employer-grid">
          {hiringTools.map((tool) => (
            <div key={tool} className="employer-tool">
              <span />
              <p>{tool}</p>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => navigate(user?.role === 'employer' ? '/employer/dashboard' : '/register')}>
          Start Hiring
        </button>
      </section>
    </div>
  );
}
