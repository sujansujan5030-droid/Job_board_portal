import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../styles/jobs.css';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/companies');
        setCompanies(res.data);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) return <div className="loading">Loading companies...</div>;

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h1>Explore Companies</h1>
        <p>Discover employers, company profiles, and active hiring teams.</p>
      </div>
      <div className="company-grid-page">
        {companies.length > 0 ? companies.map((company) => (
          <article className="company-card-page" key={company._id}>
            <div className="company-logo">{company.name.charAt(0)}</div>
            <h2>{company.name}</h2>
            <p>{company.description || 'This employer is building their public profile.'}</p>
            <small>{company.location || 'Location not added'} {company.verified ? '- Verified' : ''}</small>
            <button onClick={() => navigate(`/companies/${company._id}`)}>View profile</button>
          </article>
        )) : (
          <div className="no-jobs">No companies yet. Employer registrations will appear here.</div>
        )}
      </div>
    </div>
  );
}
