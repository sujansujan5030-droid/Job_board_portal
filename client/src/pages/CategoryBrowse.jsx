import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import JobCard from '../components/JobCard';
import '../styles/categorybrowse.css';

export default function CategoryBrowse() {
  const { categoryId } = useParams();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all categories
        const catRes = await api.get('/categories');
        const catList = catRes.data || [];
        setCategories(catList);

        // If category ID is provided, fetch that category and its jobs
        if (categoryId) {
          const selectedCat = catList.find(cat => cat._id === categoryId);
          if (selectedCat) {
            setSelectedCategory(selectedCat);
            // Fetch jobs for this category
            const jobRes = await api.get(`/categories/${categoryId}`);
            setJobs(jobRes.data.jobs || []);
          }
        }
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  const handleCategoryClick = (catId) => {
    window.location.href = `/categories/${catId}`;
  };

  if (loading) {
    return (
      <div className="category-browse loading-container">
        <div className="loader">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="category-browse">
      <div className="category-header">
        <h1>🏷️ Browse Jobs by Category</h1>
        <p>Find opportunities in your area of expertise</p>
      </div>

      {/* Categories Grid */}
      <div className="categories-section">
        <h2>Job Categories</h2>
        <div className="categories-grid">
          {categories.map(cat => (
            <div
              key={cat._id}
              className={`category-card ${selectedCategory?._id === cat._id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat._id)}
            >
              <div className="category-icon">{cat.icon || '💼'}</div>
              <h3>{cat.name}</h3>
              <p className="category-description">{cat.description}</p>
              <div className="category-stats">
                <span className="job-count">{cat.jobCount} Jobs</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Category Jobs */}
      {selectedCategory && (
        <div className="selected-category-section">
          <div className="category-detail-header">
            <div>
              <h2>
                <span className="icon">{selectedCategory.icon || '💼'}</span>
                {selectedCategory.name}
              </h2>
              <p className="category-detail-info">
                {selectedCategory.description}
              </p>
              <p className="job-count-detail">
                {jobs.length} job openings available
              </p>
            </div>
          </div>

          {jobs.length > 0 ? (
            <div className="jobs-list">
              {jobs.map(job => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            <div className="no-jobs">
              <p>No jobs found in {selectedCategory.name} at the moment.</p>
              <p>Check back soon for new opportunities!</p>
            </div>
          )}
        </div>
      )}

      {!selectedCategory && (
        <div className="select-category-prompt">
          <p>👉 Select a category to view available job openings</p>
        </div>
      )}
    </div>
  );
}
