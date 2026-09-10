import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import '../styles/jobs.css';

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/companies/${id}`);
        setCompanyData(res.data);
      } catch (err) {
        setMessage(err.response?.data?.message || 'Company not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  if (loading) return <div className="loading">Loading company...</div>;
  if (!companyData) return <div className="jobs-container"><p className="error-msg">{message || 'Company not found.'}</p></div>;

  const { company, jobs } = companyData;

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h1>{company.name}</h1>
        <p>{company.description || 'This company profile has no description yet.'}</p>
      </div>

      <div className="job-detail-grid">
        <section className="detail-panel">
          <h2>About the company</h2>
          <div className="job-meta">
            <span>{company.location || 'Location not added'}</span>
            <span>{company.verified ? 'Verified employer' : 'Unverified employer'}</span>
          </div>
          {company.website && (
            <p>
              Website:{' '}
              <a href={company.website} target="_blank" rel="noreferrer">
                {company.website}
              </a>
            </p>
          )}
        </section>

        <aside className="detail-panel apply-panel">
          <h2>Company details</h2>
          <p>{company.description || 'No description available yet.'}</p>
          <button onClick={() => navigate('/jobs')}>Browse all jobs</button>
        </aside>
      </div>

      <section className="jobs-list" style={{ marginTop: '2rem' }}>
        <h2>Active roles at {company.name}</h2>
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <article key={job._id} className="job-card">
              <div className="job-header">
                <div>
                  <h2>{job.title}</h2>
                  <p className="company">{job.company}</p>
                </div>
                <span className="job-type">{job.type}</span>
              </div>
              <div className="job-meta">
                <span>{job.location}</span>
                <span>{job.workplace}</span>
                {job.experience && <span>{job.experience}</span>}
              </div>
              <p className="job-description">{job.description.substring(0, 160)}{job.description.length > 160 ? '...' : ''}</p>
              <div className="job-card-actions">
                <button className="ghost-btn" onClick={() => navigate(`/jobs/${job._id}`)}>View Details</button>
              </div>
            </article>
          ))
        ) : (
          <div className="no-jobs">
            <p>No active jobs have been posted by this employer yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}
