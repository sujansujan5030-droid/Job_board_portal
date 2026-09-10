import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalRevenue: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user: authUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      navigate('/login');
      return;
    }
    if (authUser.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAdminData();
  }, [authLoading, authUser]);

  const fetchAdminData = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
    } catch (err) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) return <div className="loading">Loading admin dashboard...</div>;
  if (!user) return null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage the platform and view analytics</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalJobs}</div>
          <div className="stat-label">Total Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalApplications}</div>
          <div className="stat-label">Applications</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">Rs {stats.totalRevenue}</div>
          <div className="stat-label">Revenue</div>
        </div>
      </div>

      <div className="dashboard-tabs">
        {['overview', 'users', 'jobs', 'payments', 'reports'].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div>
            <h2>Platform Overview</h2>
            <div className="overview-grid">
              <div className="overview-card">
                <h3>Recent Activity</h3>
                <p>Check platform activity and user engagement.</p>
              </div>
              <div className="overview-card">
                <h3>System Health</h3>
                <p>All systems operational.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2>User Management</h2>
            <div className="management-section">
              <button className="action-btn">View All Users</button>
              <button className="action-btn">Block User</button>
              <button className="action-btn">Send Message</button>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div>
            <h2>Job Moderation</h2>
            <div className="management-section">
              <button className="action-btn">Review Pending Jobs</button>
              <button className="action-btn">Flag Suspicious Jobs</button>
              <button className="action-btn">Remove Job</button>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <h2>Payment Management</h2>
            <div className="management-section">
              <button className="action-btn">View Transactions</button>
              <button className="action-btn">Manage Subscriptions</button>
              <button className="action-btn">View Invoices</button>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h2>Reports and Analytics</h2>
            <div className="management-section">
              <button className="action-btn">Download User Report</button>
              <button className="action-btn">Download Job Report</button>
              <button className="action-btn">Download Revenue Report</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
