import express from 'express';
import Location from '../models/Location.js';
import Job from '../models/Job.js';

const router = express.Router();

// Get all locations with job/company counts
router.get('/', async (req, res) => {
  try {
    const locations = await Location.find().sort({ jobCount: -1 });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get location by ID with jobs
router.get('/:id', async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) return res.status(404).json({ message: 'Location not found' });
    
    const jobs = await Job.find({ 
      locationId: req.params.id,
      status: 'active'
    }).populate('companyId category').limit(10);
    
    res.json({ location, jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search locations by city or state
router.get('/search/query', async (req, res) => {
  try {
    const { query } = req.query;
    const locations = await Location.find({
      $or: [
        { city: { $regex: query, $options: 'i' } },
        { state: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get locations grouped by state
router.get('/grouped/bystate', async (req, res) => {
  try {
    const locations = await Location.aggregate([
      {
        $group: {
          _id: '$state',
          cities: { $push: '$$ROOT' },
          totalJobs: { $sum: '$jobCount' }
        }
      },
      { $sort: { totalJobs: -1 } }
    ]);
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get trending locations (most jobs)
router.get('/trending/now', async (req, res) => {
  try {
    const locations = await Location.find()
      .sort({ jobCount: -1 })
      .limit(10);
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
