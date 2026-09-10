import React, { useEffect, useState } from 'react';
import api from '../api';
import '../styles/advancedsearch.css';

export default function AdvancedSearch({ onSearch }) {
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    category: '',
    jobType: '',
    workplace: '',
    salaryMin: '',
    salaryMax: '',
    experienceMin: '',
    experienceMax: '',
    skills: ''
  });

  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [locRes, catRes] = await Promise.all([
          api.get('/locations'),
          api.get('/categories')
        ]);
        setLocations(locRes.data || []);
        setCategories(catRes.data || []);
      } catch (error) {
        console.error('Error fetching filters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      search: '',
      location: '',
      category: '',
      jobType: '',
      workplace: '',
      salaryMin: '',
      salaryMax: '',
      experienceMin: '',
      experienceMax: '',
      skills: ''
    });
  };

  if (loading) {
    return <div className="advanced-search loading">Loading filters...</div>;
  }

  return (
    <form className="advanced-search" onSubmit={handleSearch}>
      <div className="search-section">
        <div className="search-group full-width">
          <label>Search Jobs</label>
          <input
            type="text"
            name="search"
            placeholder="Job title, skills, or keywords..."
            value={filters.search}
            onChange={handleChange}
            className="search-input"
          />
        </div>
      </div>

      <div className="filters-grid">
        <div className="search-group">
          <label>Location</label>
          <select name="location" value={filters.location} onChange={handleChange}>
            <option value="">All Locations</option>
            {locations.map(loc => (
              <option key={loc._id} value={`${loc.city}, ${loc.state}`}>
                {loc.city}, {loc.state}
              </option>
            ))}
          </select>
        </div>

        <div className="search-group">
          <label>Category</label>
          <select name="category" value={filters.category} onChange={handleChange}>
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="search-group">
          <label>Job Type</label>
          <select name="jobType" value={filters.jobType} onChange={handleChange}>
            <option value="">All Types</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Contract">Contract</option>
            <option value="Freelance">Freelance</option>
          </select>
        </div>

        <div className="search-group">
          <label>Work Place</label>
          <select name="workplace" value={filters.workplace} onChange={handleChange}>
            <option value="">All Types</option>
            <option value="On-site">On-site</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div className="search-group">
          <label>Min Salary (LPA)</label>
          <input
            type="number"
            name="salaryMin"
            placeholder="0"
            value={filters.salaryMin}
            onChange={handleChange}
            min="0"
          />
        </div>

        <div className="search-group">
          <label>Max Salary (LPA)</label>
          <input
            type="number"
            name="salaryMax"
            placeholder="100"
            value={filters.salaryMax}
            onChange={handleChange}
            min="0"
          />
        </div>

        <div className="search-group">
          <label>Min Experience (yrs)</label>
          <input
            type="number"
            name="experienceMin"
            placeholder="0"
            value={filters.experienceMin}
            onChange={handleChange}
            min="0"
          />
        </div>

        <div className="search-group">
          <label>Max Experience (yrs)</label>
          <input
            type="number"
            name="experienceMax"
            placeholder="50"
            value={filters.experienceMax}
            onChange={handleChange}
            min="0"
          />
        </div>

        <div className="search-group full-width">
          <label>Skills (comma separated)</label>
          <input
            type="text"
            name="skills"
            placeholder="React, Node.js, MongoDB..."
            value={filters.skills}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="search-actions">
        <button type="submit" className="btn btn-primary">
          🔍 Search Jobs
        </button>
        <button type="button" onClick={handleReset} className="btn btn-secondary">
          ↺ Reset Filters
        </button>
      </div>
    </form>
  );
}
