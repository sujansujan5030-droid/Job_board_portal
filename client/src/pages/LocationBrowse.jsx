import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import JobCard from '../components/JobCard';
import '../styles/locationbrowse.css';

export default function LocationBrowse() {
  const { city } = useParams();
  const [location, setLocation] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allLocations, setAllLocations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all locations
        const locRes = await api.get('/locations');
        setAllLocations(locRes.data || []);

        // If city param exists, fetch that location and its jobs
        if (city) {
          const selectedLoc = locRes.data.find(
            loc => loc.city.toLowerCase() === city.toLowerCase()
          );

          if (selectedLoc) {
            setLocation(selectedLoc);
            // Fetch jobs for this location
            const jobRes = await api.get('/jobs/search/advanced', {
              params: { location: city }
            });
            setJobs(jobRes.data.jobs || []);
          }
        }
      } catch (error) {
        console.error('Error fetching location data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [city]);

  const handleLocationClick = (locationCity) => {
    // This would be handled by routing
    window.location.href = `/locations/${locationCity}`;
  };

  if (loading) {
    return (
      <div className="location-browse loading-container">
        <div className="loader">Loading location data...</div>
      </div>
    );
  }

  return (
    <div className="location-browse">
      <div className="location-header">
        <h1>📍 Browse Jobs by Location</h1>
        <p>Explore job opportunities in your preferred cities</p>
      </div>

      {/* All Locations Grid */}
      <div className="locations-section">
        <h2>All Locations</h2>
        <div className="locations-grid">
          {allLocations.map(loc => (
            <div
              key={loc._id}
              className={`location-card ${location?._id === loc._id ? 'active' : ''}`}
              onClick={() => handleLocationClick(loc.city)}
            >
              <div className="location-card-content">
                <h3>{loc.city}</h3>
                <p className="state">{loc.state}</p>
                <div className="location-stats">
                  <span className="stat">
                    💼 {loc.jobCount} Jobs
                  </span>
                  <span className="stat">
                    🏢 {loc.companyCount} Companies
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Location Jobs */}
      {location && (
        <div className="selected-location-section">
          <div className="location-detail-header">
            <div>
              <h2>{location.city}, {location.state}</h2>
              <p className="location-detail-info">
                {location.jobCount} job openings available
              </p>
            </div>
            <div className="location-coordinates">
              <span>📍 {location.latitude.toFixed(2)}°N, {location.longitude.toFixed(2)}°E</span>
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
              <p>No jobs found in {location.city} at the moment.</p>
              <p>Check back soon or explore other locations!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
