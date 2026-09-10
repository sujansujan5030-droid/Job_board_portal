import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          JobBoard
        </Link>
        <ul className="nav-menu">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/jobs" className={location.pathname === '/jobs' ? 'active' : ''}>
              Browse Jobs
            </Link>
          </li>
          <li>
            <Link to="/locations" className={location.pathname.includes('/locations') ? 'active' : ''}>
              📍 Locations
            </Link>
          </li>
          <li>
            <Link to="/categories" className={location.pathname.includes('/categories') ? 'active' : ''}>
              🏷️ Categories
            </Link>
          </li>
          <li>
            <Link to="/companies" className={location.pathname === '/companies' ? 'active' : ''}>
              Companies
            </Link>
          </li>
          {user?.role === 'employer' && (
            <li>
              <Link to="/employer/dashboard" className={location.pathname.includes('/employer') ? 'active' : ''}>
                Employer
              </Link>
            </li>
          )}
          {user?.role === 'admin' && (
            <li>
              <Link to="/admin/dashboard" className={location.pathname.includes('/admin') ? 'active' : ''}>
                Admin
              </Link>
            </li>
          )}
          {user?.role === 'jobseeker' && (
            <li>
              <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
                Dashboard
              </Link>
            </li>
          )}
          {user?.role === 'jobseeker' && (
            <li>
              <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
                Profile
              </Link>
            </li>
          )}
        </ul>
        <div className="nav-auth">
          {user ? (
            <>
              <span className="user-name">{user.name}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-link">
                Login
              </Link>
              <Link to="/register" className="signup-link">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
