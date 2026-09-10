import express from 'express';
import JobCategory from '../models/JobCategory.js';
import Job from '../models/Job.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await JobCategory.find().sort({ jobCount: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get category by ID with jobs
router.get('/:id', async (req, res) => {
  try {
    const category = await JobCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    const jobs = await Job.find({
      category: req.params.id,
      status: 'active'
    })
      .populate('companyId locationId')
      .limit(20);
    
    res.json({ category, jobs, jobCount: jobs.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get trending categories
router.get('/trending/now', async (req, res) => {
  try {
    const categories = await JobCategory.find()
      .sort({ jobCount: -1, popularity: -1 })
      .limit(8);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
