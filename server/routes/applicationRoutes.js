import express from 'express';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    if (req.userRole !== 'jobseeker') {
      return res.status(403).json({ message: 'Only job seekers can apply to jobs' });
    }

    const { job, coverLetter, resume } = req.body;
    const resumeData = resume?.trim();
    if (!resumeData) {
      return res.status(400).json({ message: 'Please upload your resume as a PDF before applying.' });
    }

    const foundJob = await Job.findOne({ _id: job, status: 'active' });
    if (!foundJob) return res.status(404).json({ message: 'Job not found' });

    const existing = await Application.findOne({ job, applicant: req.userId });
    if (existing) return res.status(409).json({ message: 'You have already applied to this job' });

    const application = await Application.create({
      job,
      applicant: req.userId,
      coverLetter: coverLetter?.trim(),
      resume: resumeData
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/mine', auth, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.userId })
      .populate('job')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/employer', auth, async (req, res) => {
  try {
    if (req.userRole !== 'employer' && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Employer access only' });
    }

    const jobs = await Job.find({ postedBy: req.userId }).select('_id');
    const applications = await Application.find({ job: { $in: jobs.map((job) => job._id) } })
      .populate('job')
      .populate('applicant', '-password')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.userRole !== 'employer' && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Employer access only' });
    }

    const application = await Application.findById(req.params.id).populate('job');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (req.userRole !== 'admin' && String(application.job.postedBy) !== req.userId) {
      return res.status(403).json({ message: 'You can only update your own job applications' });
    }

    const allowed = ['applied', 'shortlisted', 'interview', 'rejected'];
    const nextStatus = req.body.status;
    if (!allowed.includes(nextStatus)) return res.status(400).json({ message: 'Invalid status' });

    application.status = nextStatus;

    if (nextStatus === 'interview') {
      application.interviewDate = req.body.interviewDate ? new Date(req.body.interviewDate) : new Date();
      application.rejectionReason = '';
    } else if (nextStatus === 'rejected') {
      application.rejectionReason = req.body.rejectionReason?.trim() || 'Application rejected by the recruiter.';
      application.interviewDate = null;
    } else {
      application.interviewDate = null;
      application.rejectionReason = '';
    }

    await application.save();
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:applicantId', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin' && req.params.applicantId !== req.userId) {
      return res.status(403).json({ message: 'You can only view your own applications' });
    }

    const applications = await Application.find({ applicant: req.params.applicantId }).populate('job');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
