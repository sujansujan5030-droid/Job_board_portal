import express from 'express';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import SavedJob from '../models/SavedJob.js';
import Company from '../models/Company.js';
import { auth, employerOnly } from '../middleware/auth.js';

const router = express.Router();

const listFromInput = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
};

router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.includeClosed !== 'true') query.status = 'active';
    if (req.query.employer) query.postedBy = req.query.employer;
    if (req.query.type) query.type = req.query.type;
    if (req.query.workplace) query.workplace = req.query.workplace;

    const search = req.query.search?.trim();
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ];
    }

    if (req.query.location) {
      query.location = { $regex: req.query.location.trim(), $options: 'i' };
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email companyName')
      .populate('companyId', 'name location website logo description')
      .populate('locationId category')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Advanced search with filters
router.get('/search/advanced', async (req, res) => {
  try {
    const query = { status: 'active' };
    
    // Location filter
    if (req.query.location) {
      query.location = { $regex: req.query.location.trim(), $options: 'i' };
    }
    
    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Job type filter
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Workplace filter
    if (req.query.workplace) {
      query.workplace = req.query.workplace;
    }
    
    // Salary range filter
    if (req.query.salaryMin || req.query.salaryMax) {
      query.salaryMin = { $gte: Number(req.query.salaryMin) || 0 };
      if (req.query.salaryMax) {
        query.salaryMax = { $lte: Number(req.query.salaryMax) };
      }
    }
    
    // Experience filter
    if (req.query.experienceMin || req.query.experienceMax) {
      query.experienceMin = { $lte: Number(req.query.experienceMax) || 50 };
      if (req.query.experienceMin) {
        query.experienceMax = { $gte: Number(req.query.experienceMin) };
      }
    }
    
    // Skills filter
    if (req.query.skills) {
      const skillsArray = Array.isArray(req.query.skills) ? req.query.skills : [req.query.skills];
      query.skills = { $in: skillsArray };
    }
    
    // Search in title and description
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const jobs = await Job.find(query)
      .populate('companyId', 'name logo location')
      .populate('category', 'name')
      .populate('locationId', 'city state')
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Job.countDocuments(query);
    
    res.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get trending/featured jobs
router.get('/featured/trending', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'active', featured: true })
      .populate('companyId', 'name logo')
      .populate('category', 'name')
      .sort({ views: -1, createdAt: -1 })
      .limit(10);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get job statistics
router.get('/stats/analytics', async (req, res) => {
  try {
    const stats = await Job.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          totalApplications: { $sum: '$applications' },
          totalViews: { $sum: '$views' }
        }
      }
    ]);
    
    const jobsByLocation = await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    const jobsByCategory = await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      stats: stats[0] || { totalJobs: 0, totalApplications: 0, totalViews: 0 },
      byLocation: jobsByLocation,
      byCategory: jobsByCategory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/mine', auth, employerOnly, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.userId })
      .populate('companyId', 'name location website logo description')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('postedBy', 'name email companyName')
      .populate('companyId', 'name location website logo description');
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const company = job.companyId || (await Company.findOne({ name: job.company }));
    res.json({ job, company });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/summary', auth, employerOnly, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, postedBy: req.userId });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const applications = await Application.find({ job: job._id }).populate('applicant', '-password').sort({ createdAt: -1 });
    const savedCount = await SavedJob.countDocuments({ job: job._id });
    res.json({ job, applications, savedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, employerOnly, async (req, res) => {
  try {
    const { title, company, location, type, workplace, experience, openings, industry, salary, description, deadline } =
      req.body;

    if (!title || !company || !location || !type || !description) {
      return res.status(400).json({ message: 'Title, company, location, type, and description are required' });
    }

    const employerCompany = await Company.findOne({ employer: req.userId });
    const job = await Job.create({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      type,
      workplace: workplace || 'On-site',
      experience: experience?.trim(),
      openings: Number(openings) || 1,
      industry: industry?.trim(),
      salary: salary?.trim(),
      description: description.trim(),
      requirements: listFromInput(req.body.requirements),
      skills: listFromInput(req.body.skills),
      benefits: listFromInput(req.body.benefits),
      deadline: deadline || undefined,
      postedBy: req.userId,
      companyId: employerCompany?._id
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id', auth, employerOnly, async (req, res) => {
  try {
    const updates = {
      ...req.body,
      ...(req.body.requirements !== undefined ? { requirements: listFromInput(req.body.requirements) } : {}),
      ...(req.body.skills !== undefined ? { skills: listFromInput(req.body.skills) } : {}),
      ...(req.body.benefits !== undefined ? { benefits: listFromInput(req.body.benefits) } : {})
    };

    const job = await Job.findOneAndUpdate({ _id: req.params.id, postedBy: req.userId }, updates, { new: true });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', auth, employerOnly, async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate({ _id: req.params.id, postedBy: req.userId }, { status: 'closed' }, { new: true });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job closed', job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
