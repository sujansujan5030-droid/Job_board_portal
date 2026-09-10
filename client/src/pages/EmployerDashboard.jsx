import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

const emptyJob = {
  title: '',
  company: '',
  location: '',
  type: 'Full Time',
  workplace: 'On-site',
  experience: '',
  openings: 1,
  industry: '',
  salary: '',
  description: '',
  skills: '',
  requirements: '',
  benefits: ''
};

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [company, setCompany] = useState(null);
  const [activeTab, setActiveTab] = useState('jobs');
  const [loading, setLoading] = useState(true);
  const [jobForm, setJobForm] = useState(emptyJob);
  const [companyForm, setCompanyForm] = useState({ name: '', description: '', website: '', location: '', logo: '' });
  const [decisionDrafts, setDecisionDrafts] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'employer') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [authLoading, user]);

  const fetchData = async () => {
    try {
      const [jobsRes, appsRes, companyRes, candidatesRes] = await Promise.all([
        api.get('/jobs/mine'),
        api.get('/applications/employer'),
        api.get('/companies/me'),
        api.get('/profile/candidates')
      ]);
      setJobs(jobsRes.data);
      setApplications(appsRes.data);
      setCandidates(candidatesRes.data);
      setCompany(companyRes.data);
      setCompanyForm({
        name: companyRes.data?.name || user.companyName || '',
        description: companyRes.data?.description || '',
        website: companyRes.data?.website || '',
        location: companyRes.data?.location || '',
        logo: companyRes.data?.logo || ''
      });
      setJobForm((prev) => ({ ...prev, company: companyRes.data?.name || user.companyName || '' }));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not load employer dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const updateJob = (e) => {
    const { name, value } = e.target;
    setJobForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateCompany = (e) => {
    const { name, value } = e.target;
    setCompanyForm((prev) => ({ ...prev, [name]: value }));
  };

  const postJob = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/jobs', jobForm);
      setJobs((prev) => [res.data, ...prev]);
      setJobForm({ ...emptyJob, company: companyForm.name || user.companyName || '' });
      setActiveTab('jobs');
      setMessage('Job posted successfully.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not post job.');
    }
  };

  const closeJob = async (id) => {
    await api.delete(`/jobs/${id}`);
    setJobs((prev) => prev.map((job) => (job._id === id ? { ...job, status: 'closed' } : job)));
  };

  const formatDateValue = (value) => {
    if (!value) return new Date().toISOString().slice(0, 10);
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10);
  };

  const updateDraft = (applicationId, field, value) => {
    setDecisionDrafts((prev) => ({
      ...prev,
      [applicationId]: {
        ...(prev[applicationId] || {}),
        [field]: value
      }
    }));
  };

  const openResume = async (event, resume) => {
    if (!resume.startsWith('data:')) return;

    event.preventDefault();
    const resumeWindow = window.open('', '_blank');
    if (!resumeWindow) {
      setMessage('Please allow pop-ups to view the resume PDF.');
      return;
    }

    try {
      const response = await fetch(resume);
      const blobUrl = URL.createObjectURL(await response.blob());
      resumeWindow.location.href = blobUrl;
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch {
      resumeWindow.close();
      setMessage('Could not open this resume PDF.');
    }
  };

  const getDraft = (app) => {
    const draft = decisionDrafts[app._id] || {};
    return {
      status: draft.status || app.status || 'applied',
      interviewDate: draft.interviewDate || formatDateValue(app.interviewDate),
      rejectionReason: draft.rejectionReason ?? (app.rejectionReason || '')
    };
  };

  const updateStatus = async (applicationId, status, interviewDate, rejectionReason) => {
    const payload = { status };

    if (status === 'interview') {
      payload.interviewDate = interviewDate || formatDateValue(new Date());
    }

    if (status === 'rejected') {
      payload.rejectionReason = rejectionReason?.trim() || 'Application rejected by the recruiter.';
    }

    const res = await api.patch(`/applications/${applicationId}/status`, payload);
    setApplications((prev) => prev.map((app) => (app._id === applicationId ? { ...app, ...res.data } : app)));
  };

  const saveCompany = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/companies/me', companyForm);
      setCompany(res.data);
      setJobForm((prev) => ({ ...prev, company: res.data.name }));
      setMessage('Company profile saved.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not save company.');
    }
  };

  if (loading || authLoading) return <div className="loading">Loading employer dashboard...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header dashboard-hero">
        <div>
          <h1>{company?.name || user.companyName || 'Employer'} hiring workspace</h1>
          <p>Post jobs, review applicants, update statuses, and discover candidates.</p>
        </div>
        <button className="submit-btn" onClick={() => setActiveTab('post')}>Post Job</button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card"><div className="stat-number">{jobs.filter((j) => j.status === 'active').length}</div><div className="stat-label">Active Jobs</div></div>
        <div className="stat-card"><div className="stat-number">{applications.length}</div><div className="stat-label">Applicants</div></div>
        <div className="stat-card"><div className="stat-number">{applications.filter((a) => a.status === 'shortlisted').length}</div><div className="stat-label">Shortlisted</div></div>
        <div className="stat-card"><div className="stat-number">{jobs.reduce((sum, job) => sum + (job.views || 0), 0)}</div><div className="stat-label">Job Views</div></div>
      </div>

      {message && <p className={message.includes('success') || message.includes('saved') ? 'success-msg' : 'error-msg'}>{message}</p>}

      <div className="dashboard-tabs">
        {['jobs', 'post', 'applicants', 'company', 'candidates'].map((tab) => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'jobs' && (
          <section>
            <h2>My Job Postings</h2>
            <div className="jobs-list">
              {jobs.map((job) => (
                <article key={job._id} className="job-item">
                  <div className="job-header">
                    <div><h3>{job.title}</h3><p>{job.location} - {job.workplace} - {job.type}</p></div>
                    <span className={`status status-${job.status}`}>{job.status}</span>
                  </div>
                  <p>{job.skills?.join(', ')}</p>
                  <div className="job-actions">
                    <button className="view-btn" onClick={() => navigate(`/jobs/${job._id}`)}>View Public Page</button>
                    {job.status === 'active' && <button className="edit-btn" onClick={() => closeJob(job._id)}>Close Job</button>}
                  </div>
                </article>
              ))}
              {!jobs.length && <p>No jobs posted yet.</p>}
            </div>
          </section>
        )}

        {activeTab === 'post' && (
          <section className="post-job-form">
            <h2>Post a New Job</h2>
            <form onSubmit={postJob}>
              <div className="form-row">
                <div className="form-group"><label>Job Title *</label><input name="title" value={jobForm.title} onChange={updateJob} required /></div>
                <div className="form-group"><label>Company *</label><input name="company" value={jobForm.company} onChange={updateJob} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Location *</label><input name="location" value={jobForm.location} onChange={updateJob} required /></div>
                <div className="form-group"><label>Salary</label><input name="salary" value={jobForm.salary} onChange={updateJob} placeholder="Rs 8 LPA - Rs 14 LPA" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Type</label><select name="type" value={jobForm.type} onChange={updateJob}><option>Full Time</option><option>Part Time</option><option>Contract</option><option>Freelance</option></select></div>
                <div className="form-group"><label>Work mode</label><select name="workplace" value={jobForm.workplace} onChange={updateJob}><option>On-site</option><option>Remote</option><option>Hybrid</option></select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Experience</label><input name="experience" value={jobForm.experience} onChange={updateJob} placeholder="2-5 years" /></div>
                <div className="form-group"><label>Openings</label><input type="number" min="1" name="openings" value={jobForm.openings} onChange={updateJob} /></div>
              </div>
              <div className="form-group"><label>Industry</label><input name="industry" value={jobForm.industry} onChange={updateJob} /></div>
              <div className="form-group"><label>Description *</label><textarea name="description" value={jobForm.description} onChange={updateJob} rows={6} required /></div>
              <div className="form-group"><label>Skills (comma separated)</label><input name="skills" value={jobForm.skills} onChange={updateJob} /></div>
              <div className="form-group"><label>Requirements (comma separated)</label><textarea name="requirements" value={jobForm.requirements} onChange={updateJob} rows={3} /></div>
              <div className="form-group"><label>Benefits (comma separated)</label><input name="benefits" value={jobForm.benefits} onChange={updateJob} /></div>
              <button className="submit-btn" type="submit">Publish Job</button>
            </form>
          </section>
        )}

        {activeTab === 'applicants' && (
          <section>
            <h2>Applicant Pipeline</h2>
            <div className="applications-list">
              {applications.map((app) => {
                const draft = getDraft(app);

                return (
                  <article key={app._id} className="app-item">
                    <div className="app-header">
                      <div><h3>{app.applicant?.name}</h3><p>{app.job?.title} - {app.applicant?.email}</p></div>
                      <span className={`status status-${draft.status}`}>{draft.status}</span>
                    </div>
                    {app.coverLetter && <p>{app.coverLetter}</p>}
                    {app.resume && (
                      <p>
                        <a
                          href={app.resume}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) => openResume(event, app.resume)}
                        >
                          View resume PDF
                        </a>
                      </p>
                    )}
                    {draft.status === 'interview' && (
                      <button className="submit-btn" onClick={() => navigate(`/interview/${app._id}`)}>
                        Open interview room
                      </button>
                    )}

                    <div className="job-actions" style={{ display: 'grid', gap: '10px', marginTop: '12px' }}>
                      <label>
                        Status
                        <select
                          value={draft.status}
                          onChange={(e) => updateDraft(app._id, 'status', e.target.value)}
                        >
                          <option value="applied">Applied</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interview">Interview</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </label>

                      {draft.status === 'interview' && (
                        <label>
                          Interview date
                          <input
                            type="date"
                            value={draft.interviewDate}
                            onChange={(e) => updateDraft(app._id, 'interviewDate', e.target.value)}
                          />
                        </label>
                      )}

                      {draft.status === 'rejected' && (
                        <label>
                          Rejection reason
                          <textarea
                            rows={3}
                            value={draft.rejectionReason}
                            onChange={(e) => updateDraft(app._id, 'rejectionReason', e.target.value)}
                          />
                        </label>
                      )}

                      <button
                        className="edit-btn"
                        onClick={() => updateStatus(app._id, draft.status, draft.interviewDate, draft.rejectionReason)}
                      >
                        Save status
                      </button>
                    </div>
                  </article>
                );
              })}
              {!applications.length && <p>No applicants yet.</p>}
            </div>
          </section>
        )}

        {activeTab === 'company' && (
          <section className="post-job-form">
            <h2>Company Profile</h2>
            <form onSubmit={saveCompany}>
              <div className="form-row">
                <div className="form-group"><label>Company Name *</label><input name="name" value={companyForm.name} onChange={updateCompany} required /></div>
                <div className="form-group"><label>Location</label><input name="location" value={companyForm.location} onChange={updateCompany} /></div>
              </div>
              <div className="form-group"><label>Website</label><input name="website" value={companyForm.website} onChange={updateCompany} /></div>
              <div className="form-group"><label>Logo URL</label><input name="logo" value={companyForm.logo} onChange={updateCompany} /></div>
              <div className="form-group"><label>Description</label><textarea name="description" value={companyForm.description} onChange={updateCompany} rows={5} /></div>
              <button className="submit-btn" type="submit">Save Company</button>
            </form>
          </section>
        )}

        {activeTab === 'candidates' && (
          <section>
            <h2>Candidate Search</h2>
            <div className="candidate-grid">
              {candidates.map((profile) => (
                <article key={profile._id} className="candidate-card">
                  <h3>{profile.user?.name}</h3>
                  <p>{profile.headline || 'Candidate profile'}</p>
                  <div className="skill-list">{profile.skills?.slice(0, 5).map((skill) => <span key={skill}>{skill}</span>)}</div>
                  <small>{profile.user?.email}</small>
                  <div className="job-actions">
                    <button className="view-btn" onClick={() => navigate(`/candidates/${profile._id}`)}>
                      View profile
                    </button>
                  </div>
                </article>
              ))}
              {!candidates.length && <p>No public candidate profiles yet.</p>}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
