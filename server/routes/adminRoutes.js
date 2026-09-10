import express from 'express';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', auth, adminOnly, async (_req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const jobSeekers = await User.countDocuments({ role: 'jobseeker' });
    const employers = await User.countDocuments({ role: 'employer' });

    res.json({
      totalUsers,
      totalJobs,
      totalApplications,
      jobSeekers,
      employers,
      totalRevenue: 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/users', auth, adminOnly, async (_req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
