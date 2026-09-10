import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

export default function JobSeekerDashboard() {
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [activeTab, setActiveTab] = useState('applications');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'jobseeker') {
      navigate(user.role === 'employer' ? '/employer/dashboard' : '/admin/dashboard');
      return;
    }
    fetchData();
  }, [authLoading, user]);

  const fetchData = async () => {
    try {
      const [appsRes, savedRes, jobsRes] = await Promise.all([
        api.get('/applications/mine'),
        api.get('/saved-jobs/saved'),
        api.get('/jobs')
      ]);
      setApplications(appsRes.data);
      setSavedJobs(savedRes.data);
      setRecommended(jobsRes.data.slice(0, 4));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const unsave = async (jobId) => {
    await api.delete(`/saved-jobs/save/${jobId}`);
    setSavedJobs((prev) => prev.filter((saved) => saved.job?._id !== jobId));
  };

  const apply = async (jobId) => {
    try {
      await api.post('/applications', { job: jobId, coverLetter: 'Applied from candidate dashboard.' });
      setMessage('Application submitted.');
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not apply.');
    }
  };

  if (loading || authLoading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header dashboard-hero">
        <div>
          <h1>Hi {user.name}, manage your job search</h1>
          <p>Track applications, saved jobs, interviews, and recruiter-ready profile details.</p>
        </div>
        <button className="submit-btn" onClick={() => navigate('/profile')}>Complete Profile</button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card"><div className="stat-number">{applications.length}</div><div className="stat-label">Applications</div></div>
        <div className="stat-card"><div className="stat-number">{savedJobs.length}</div><div className="stat-label">Saved Jobs</div></div>
        <div className="stat-card"><div className="stat-number">{applications.filter((a) => a.status === 'shortlisted').length}</div><div className="stat-label">Shortlisted</div></div>
        <div className="stat-card"><div className="stat-number">{applications.filter((a) => a.status === 'interview').length}</div><div className="stat-label">Interviews</div></div>
      </div>

      {message && <p className={message.includes('submitted') ? 'success-msg' : 'error-msg'}>{message}</p>}

      <div className="dashboard-tabs">
        {['applications', 'saved', 'recommended', 'career'].map((tab) => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'applications' && (
          <section>
            <h2>Application Tracker</h2>
            {applications.length ? (
              <div className="applications-list">
                {applications.map((app) => (
                  <article key={app._id} className="app-item">
                    <div className="app-header">
                      <div>
                        <h3>{app.job?.title || 'Unavailable job'}</h3>
                        <p>{app.job?.company} - {app.job?.location}</p>
                      </div>
                      <span className={`status status-${app.status}`}>{app.status}</span>
                    </div>
                    <small>Applied on {new Date(app.createdAt).toLocaleDateString()}</small>
                    {app.status === 'interview' && app.interviewDate && (
                      <>
                        <p><strong>Interview date:</strong> {new Date(app.interviewDate).toLocaleDateString()}</p>
                        <button className="submit-btn" onClick={() => navigate(`/interview/${app._id}`)}>
                          Join interview
                        </button>
                      </>
                    )}
                    {app.status === 'rejected' && app.rejectionReason && (
                      <p><strong>Rejection note:</strong> {app.rejectionReason}</p>
                    )}
                  </article>
                ))}
              </div>
            ) : <p>No applications yet. <Link to="/jobs">Apply to jobs</Link></p>}
          </section>
        )}

        {activeTab === 'saved' && (
          <section>
            <h2>Saved Jobs</h2>
            {savedJobs.length ? (
              <div className="jobs-list">
                {savedJobs.map((saved) => saved.job && (
                  <article key={saved._id} className="job-item">
                    <div className="job-header"><h3>{saved.job.title}</h3><span className="status status-active">{saved.job.type}</span></div>
                    <p>{saved.job.company} - {saved.job.location}</p>
                    <div className="job-actions">
                      <button className="view-btn" onClick={() => navigate(`/jobs/${saved.job._id}`)}>View</button>
                      <button className="edit-btn" onClick={() => apply(saved.job._id)}>Apply</button>
                      <button className="edit-btn" onClick={() => unsave(saved.job._id)}>Remove</button>
                    </div>
                  </article>
                ))}
              </div>
            ) : <p>No saved jobs yet. Save roles from <Link to="/jobs">Browse Jobs</Link>.</p>}
          </section>
        )}

        {activeTab === 'recommended' && (
          <section>
            <h2>Recommended Active Roles</h2>
            <div className="jobs-list">
              {recommended.map((job) => (
                <article key={job._id} className="job-item">
                  <div className="job-header"><h3>{job.title}</h3><span className="status status-active">{job.workplace}</span></div>
                  <p>{job.company} - {job.location}</p>
                  <div className="job-actions">
                    <button className="view-btn" onClick={() => navigate(`/jobs/${job._id}`)}>Details</button>
                    <button className="edit-btn" onClick={() => apply(job._id)}>Apply</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'career' && (
          <section>
            <h2>Career Checklist</h2>
            <div className="overview-grid">
              <div className="overview-card"><h3>Profile strength</h3><p>Add headline, skills, education, and resume link.</p></div>
              <div className="overview-card"><h3>Follow-up plan</h3><p>Move shortlisted and interview applications into your weekly plan.</p></div>
              <div className="overview-card"><h3>Saved roles</h3><p>Use saved jobs as your shortlist before applying.</p></div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
