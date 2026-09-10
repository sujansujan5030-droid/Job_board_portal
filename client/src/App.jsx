import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Register from './pages/Register';
import Login from './pages/Login';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import JobDetails from './pages/JobDetails';
import Companies from './pages/Companies';
import CompanyDetails from './pages/CompanyDetails';
import CandidateProfile from './pages/CandidateProfile';
import Profile from './pages/Profile';
import LocationBrowse from './pages/LocationBrowse';
import CategoryBrowse from './pages/CategoryBrowse';
import InterviewRoom from './pages/InterviewRoom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/index.css';

// Inner component to handle routing with auth
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  // If not logged in, only show login/register pages
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Redirect all other routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If logged in, show all pages with navbar
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Home - after login */}
          <Route path="/" element={<Home />} />

          {/* Job Browsing */}
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />

          {/* Location & Category Browsing */}
          <Route path="/locations" element={<LocationBrowse />} />
          <Route path="/locations/:city" element={<LocationBrowse />} />
          <Route path="/categories" element={<CategoryBrowse />} />
          <Route path="/categories/:categoryId" element={<CategoryBrowse />} />

          {/* Company Pages */}
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:id" element={<CompanyDetails />} />

          {/* Profile Pages */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/candidates/:id" element={<CandidateProfile />} />

          {/* Dashboards (role-based access) */}
          <Route path="/dashboard" element={<JobSeekerDashboard />} />
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/interview/:applicationId" element={<InterviewRoom />} />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="app">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

