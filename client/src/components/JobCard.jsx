import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/jobcard.css';

export default function JobCard({ job }) {
  if (!job) return null;

  const getSalaryDisplay = () => {
    if (job.salaryMin && job.salaryMax) {
      return `₹${job.salaryMin}L - ₹${job.salaryMax}L`;
    }
    return job.salary || 'Not disclosed';
  };

  const getExperienceDisplay = () => {
    if (job.experienceMin !== undefined && job.experienceMax !== undefined) {
      return `${job.experienceMin}-${job.experienceMax} yrs`;
    }
    return job.experience || 'Not specified';
  };

  return (
    <Link to={`/jobs/${job._id}`} className="job-card-link">
      <div className="job-card">
        <div className="job-card-header">
          <div className="job-card-title-section">
            <h3 className="job-title">{job.title}</h3>
            <p className="company-name">{job.company}</p>
          </div>
          {job.featured && <span className="featured-badge">Featured</span>}
        </div>

        <div className="job-card-meta">
          <span className="meta-item">
            📍 {job.location}
          </span>
          <span className="meta-item">
            💼 {job.type}
          </span>
          <span className="meta-item">
            🏢 {job.workplace}
          </span>
        </div>

        <div className="job-card-details">
          <div className="detail-group">
            <span className="detail-label">Salary:</span>
            <span className="detail-value">{getSalaryDisplay()}</span>
          </div>
          <div className="detail-group">
            <span className="detail-label">Experience:</span>
            <span className="detail-value">{getExperienceDisplay()}</span>
          </div>
          <div className="detail-group">
            <span className="detail-label">Openings:</span>
            <span className="detail-value">{job.openings}</span>
          </div>
        </div>

        {job.skills && job.skills.length > 0 && (
          <div className="job-card-skills">
            {job.skills.slice(0, 4).map((skill, idx) => (
              <span key={idx} className="skill-tag">
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="skill-tag more">+{job.skills.length - 4}</span>
            )}
          </div>
        )}

        <div className="job-card-footer">
          <span className="posted-time">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
          <span className="job-stats">👁 {job.views} views</span>
        </div>
      </div>
    </Link>
  );
}
