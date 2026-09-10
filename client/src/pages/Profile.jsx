import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

export default function Profile() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    profilePicture: '',
    headline: '',
    bio: '',
    skills: '',
    experience: '',
    education: '',
    resume: '',
    visible: true
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'jobseeker') {
      navigate('/');
      return;
    }

    const loadProfile = async () => {
      const res = await api.get('/profile/me');
      const profile = res.data;
      setForm({
        name: profile?.user?.name || user.name || '',
        phone: profile?.user?.phone || user.phone || '',
        profilePicture: profile?.profilePicture || user.profilePhoto || '',
        headline: profile?.headline || '',
        bio: profile?.bio || '',
        skills: profile?.skills?.join(', ') || '',
        experience: profile?.experience || '',
        education: profile?.education || '',
        resume: profile?.resume || '',
        visible: profile?.visible !== false
      });
    };

    loadProfile();
  }, [authLoading, user]);

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, profilePicture: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.put('/profile/me', {
        ...form,
        skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean)
      });
      await refreshUser();
      setMessage('Profile saved. Employers can now discover your public candidate profile.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not save profile.');
    }
  };

  if (authLoading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Candidate Profile</h1>
        <p>Keep your profile complete so recruiters can evaluate you quickly.</p>
      </div>
      <form className="tab-content profile-form" onSubmit={save}>
        <div className="profile-photo-section">
          <img
            src={form.profilePicture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(form.name || 'Candidate') + '&background=2563eb&color=fff'}
            alt="Profile preview"
            className="profile-photo-preview"
          />
          <div className="form-group photo-input-group">
            <label>Profile photo</label>
            <div className="profile-photo-upload">
              <label className="upload-photo-label">
                <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                <span>Choose from gallery</span>
              </label>
              {form.profilePicture && (
                <button
                  type="button"
                  className="clear-photo-btn"
                  onClick={() => setForm((prev) => ({ ...prev, profilePicture: '' }))}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Name</label>
            <input name="name" value={form.name} onChange={update} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={update} />
          </div>
        </div>
        <div className="form-group">
          <label>Professional headline</label>
          <input name="headline" value={form.headline} onChange={update} placeholder="React Developer | MERN Stack | 2 years" />
        </div>
        <div className="form-group">
          <label>Skills</label>
          <input name="skills" value={form.skills} onChange={update} placeholder="React, Node.js, MongoDB" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Experience</label>
            <textarea name="experience" value={form.experience} onChange={update} rows={5} />
          </div>
          <div className="form-group">
            <label>Education</label>
            <textarea name="education" value={form.education} onChange={update} rows={5} />
          </div>
        </div>
        <div className="form-group">
          <label>About you</label>
          <textarea name="bio" value={form.bio} onChange={update} rows={5} />
        </div>
        <div className="form-group">
          <label>Resume link</label>
          <input name="resume" value={form.resume} onChange={update} placeholder="Google Drive, portfolio, or PDF URL" />
        </div>
        <label className="inline-check">
          <input type="checkbox" name="visible" checked={form.visible} onChange={update} />
          Show my profile to employers
        </label>
        {message && <p className={message.includes('saved') ? 'success-msg' : 'error-msg'}>{message}</p>}
        <button className="submit-btn" type="submit">Save Profile</button>
      </form>
    </div>
  );
}
