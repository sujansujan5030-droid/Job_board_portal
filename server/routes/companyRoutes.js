import express from 'express';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import { auth, employerOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', auth, employerOnly, async (req, res) => {
  try {
    const company = await Company.findOne({ employer: req.userId });
    res.json(company || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/me', auth, employerOnly, async (req, res) => {
  try {
    const { name, description, website, logo, location } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Company name is required' });

    const company = await Company.findOneAndUpdate(
      { employer: req.userId },
      {
        name: name.trim(),
        employer: req.userId,
        description: description?.trim(),
        website: website?.trim(),
        logo: logo?.trim(),
        location: location?.trim()
      },
      { new: true, upsert: true }
    );

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const jobs = await Job.find({
      $or: [{ companyId: company._id }, { company: company.name }],
      status: 'active'
    }).sort({ createdAt: -1 });
    res.json({ company, jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
