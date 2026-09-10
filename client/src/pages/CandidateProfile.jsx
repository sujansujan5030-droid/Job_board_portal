import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import '../styles/dashboard.css';

export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/profile/public/${id}`);
        setProfile(res.data);
      } catch (err) {
        setMessage(err.response?.data?.message || 'Profile not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!profile) return <div className="dashboard-container"><p className="error-msg">{message || 'Profile not found.'}</p></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header dashboard-hero">
        <div>
          <h1>{profile.user?.name}</h1>
          <p>{profile.headline || 'Candidate profile'}</p>
        </div>
        <button className="submit-btn" onClick={() => navigate('/employer/dashboard')}>
          Back to employer dashboard
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{profile.skills?.length || 0}</div>
          <div className="stat-label">Skills listed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{profile.experience ? 'Yes' : 'No'}</div>
          <div className="stat-label">Experience details</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{profile.education ? 'Yes' : 'No'}</div>
          <div className="stat-label">Education</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{profile.resume ? 'Yes' : 'No'}</div>
          <div className="stat-label">Resume provided</div>
        </div>
      </div>

      <div className="tab-content">
        <section>
          <h2>About the candidate</h2>
          <div className="profile-info">
            <div className="info-group">
              <label>Email</label>
              <p>{profile.user?.email}</p>
            </div>
            <div className="info-group">
              <label>Phone</label>
              <p>{profile.user?.phone || 'Not shared'}</p>
            </div>
            <div className="info-group">
              <label>Headline</label>
              <p>{profile.headline || 'No headline available.'}</p>
            </div>
            <div className="info-group">
              <label>Skills</label>
              <p>{profile.skills?.length ? profile.skills.join(', ') : 'No skills listed.'}</p>
            </div>
            <div className="info-group">
              <label>Experience</label>
              <p>{profile.experience || 'Experience details not added.'}</p>
            </div>
            <div className="info-group">
              <label>Education</label>
              <p>{profile.education || 'Education details not added.'}</p>
            </div>
            <div className="info-group">
              <label>Summary</label>
              <p>{profile.bio || 'No biography added yet.'}</p>
            </div>
            {profile.resume && (
              <div className="info-group">
                <label>Resume</label>
                <p>
                  <a href={profile.resume} target="_blank" rel="noreferrer">
                    View resume
                  </a>
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
