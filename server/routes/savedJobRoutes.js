import express from 'express';
import SavedJob from '../models/SavedJob.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/save', auth, async (req, res) => {
  try {
    if (req.userRole !== 'jobseeker') return res.status(403).json({ message: 'Only job seekers can save jobs' });

    const { jobId } = req.body;
    const existingSave = await SavedJob.findOne({ jobSeeker: req.userId, job: jobId });

    if (existingSave) {
      return res.status(409).json({ message: 'Job already saved' });
    }

    const savedJob = await SavedJob.create({
      jobSeeker: req.userId,
      job: jobId
    });

    res.status(201).json(savedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/saved', auth, async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ jobSeeker: req.userId }).populate('job').sort({ createdAt: -1 });
    res.json(savedJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/save/:jobId', auth, async (req, res) => {
  try {
    await SavedJob.deleteOne({ jobSeeker: req.userId, job: req.params.jobId });
    res.json({ message: 'Job unsaved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
