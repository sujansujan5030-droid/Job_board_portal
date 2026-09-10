import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import AdvancedSearch from '../components/AdvancedSearch';
import '../styles/jobs.css';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const handleSearch = async (filters) => {
    setLoading(true);
    setMessage('');
    try {
      // Build query params, converting skills string to array
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.location) params.set('location', filters.location);
      if (filters.category) params.set('category', filters.category);
      if (filters.jobType) params.set('type', filters.jobType);
      if (filters.workplace) params.set('workplace', filters.workplace);
      if (filters.salaryMin) params.set('salaryMin', filters.salaryMin);
      if (filters.salaryMax) params.set('salaryMax', filters.salaryMax);
      if (filters.experienceMin) params.set('experienceMin', filters.experienceMin);
      if (filters.experienceMax) params.set('experienceMax', filters.experienceMax);
      if (filters.skills) params.set('skills', filters.skills);

      const res = await api.get(`/jobs/search/advanced?${params.toString()}`);
      setJobs(res.data.jobs || []);
      setPagination(res.data.pagination || {});
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to fetch jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'jobseeker') {
      setMessage('Only job seekers can apply to jobs.');
      return;
    }

    try {
      await api.post('/applications', {
        job: jobId,
        coverLetter: 'Applied from Browse Jobs.'
      });
      setMessage('✅ Application submitted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not submit application.');
    }
  };

  const handleSave = async (jobId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/saved-jobs/save', { jobId });
      setMessage('✅ Job saved to your dashboard!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not save this job.');
    }
  };

  // Fetch initial jobs on component mount
  useEffect(() => {
    handleSearch({});
  }, []);

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h1>🔍 Advanced Job Search</h1>
        <p>Find your perfect job with powerful filters and advanced search capabilities</p>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success-msg' : 'error-msg'}`}>
          {message}
        </div>
      )}

      <AdvancedSearch onSearch={handleSearch} />

      <div className="jobs-results">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Searching jobs...</p>
          </div>
        ) : jobs.length > 0 ? (
          <>
            <div className="results-header">
              <h2>Found {pagination.total || 0} jobs</h2>
              <p className="results-count">Showing {jobs.length} results</p>
            </div>

            <div className="jobs-list">
              {jobs.map((job) => (
                <div key={job._id} className="job-item-wrapper">
                  <JobCard job={job} />
                  <div className="job-actions">
                    <button
                      className="action-btn save-btn"
                      onClick={() => handleSave(job._id)}
                      title="Save job"
                    >
                      💾 Save
                    </button>
                    <button
                      className="action-btn view-btn"
                      onClick={() => navigate(`/jobs/${job._id}`)}
                      title="View details"
                    >
                      👁 View
                    </button>
                    <button
                      className="action-btn apply-btn"
                      onClick={() => handleApply(job._id)}
                      title="Apply now"
                    >
                      ✨ Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <p>
                  Page {pagination.page} of {pagination.pages}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="no-jobs">
            <p>🔍 No jobs found matching your criteria.</p>
            <p>Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}
