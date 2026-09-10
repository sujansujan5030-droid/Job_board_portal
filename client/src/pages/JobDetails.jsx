import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import '../styles/jobs.css';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [company, setCompany] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const handleResumeUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setMessage('Please upload a PDF resume.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setResume(String(reader.result));
      setMessage('');
    };
    reader.onerror = () => {
      setMessage('Could not read the selected PDF. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (user?.resume) {
      setResume(user.resume);
    }

    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data.job);
        setCompany(res.data.company);
      } catch (err) {
        setMessage(err.response?.data?.message || 'Job not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, user?.resume]);

  const apply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'jobseeker') {
      setMessage('Only job seeker accounts can apply to jobs.');
      return;
    }

    if (!resume.trim()) {
      setMessage('Please upload your resume as a PDF before applying.');
      return;
    }

    try {
      await api.post('/applications', { job: id, coverLetter, resume });
      setMessage('Application submitted. Track it from your dashboard.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not apply to this job.');
    }
  };

  const save = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await api.post('/saved-jobs/save', { jobId: id });
      setMessage('Job saved to your dashboard.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not save this job.');
    }
  };

  if (loading) return <div className="loading">Loading job...</div>;
  if (!job) return <div className="jobs-container"><p className="error-msg">{message}</p></div>;

  return (
    <div className="job-detail-page">
      <section className="job-detail-hero">
        <div>
          <Link to="/jobs">Back to jobs</Link>
          <h1>{job.title}</h1>
          <p>{job.company} - {job.location} - {job.workplace}</p>
          <div className="job-detail-tags">
            <span>{job.type}</span>
            {job.experience && <span>{job.experience}</span>}
            {job.salary && <span>{job.salary}</span>}
            <span>{job.openings || 1} opening{job.openings === 1 ? '' : 's'}</span>
          </div>
        </div>
        <aside>
          <strong>{job.views || 0}</strong>
          <span>views</span>
          <button onClick={apply}>Apply Now</button>
          <button className="ghost-btn" onClick={save}>Save Job</button>
        </aside>
      </section>

      {message && <p className={message.includes('submitted') || message.includes('saved') ? 'success-msg' : 'error-msg'}>{message}</p>}

      <main className="job-detail-grid">
        <section className="detail-panel">
          <h2>Job description</h2>
          <p>{job.description}</p>

          {job.skills?.length > 0 && (
            <>
              <h3>Key skills</h3>
              <div className="skill-list">
                {job.skills.map((skill) => <span key={skill}>{skill}</span>)}
              </div>
            </>
          )}

          {job.requirements?.length > 0 && (
            <>
              <h3>Requirements</h3>
              <ul>
                {job.requirements.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </>
          )}

          {job.benefits?.length > 0 && (
            <>
              <h3>Benefits</h3>
              <ul>
                {job.benefits.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </>
          )}
        </section>

        <aside className="detail-panel apply-panel">
          <h2>Apply with cover note</h2>
          <label>
            Upload PDF resume
            <input type="file" accept="application/pdf" onChange={handleResumeUpload} />
          </label>
          {resume && (
            <small>Resume selected: PDF ready for submission</small>
          )}
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Write a short note for the recruiter..."
            rows={7}
          />
          <button onClick={apply}>Submit Application</button>

          <div className="company-mini">
            <h3>{job.company}</h3>
            <p>{company?.description || 'Company profile is being completed by the employer.'}</p>
            {company?.website && <a href={company.website} target="_blank" rel="noreferrer">Visit website</a>}
            {company?._id && (
              <button className="ghost-btn" onClick={() => navigate(`/companies/${company._id}`)}>
                View company profile
              </button>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
