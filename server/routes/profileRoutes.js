import express from 'express';
import Profile from '../models/Profile.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.userId }).populate('user', '-password');
    res.json(profile || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/me', auth, async (req, res) => {
  try {
    const { name, phone, headline, bio, skills, experience, education, resume, profilePicture, visible } = req.body;

    if (name || phone || profilePicture !== undefined) {
      await User.findByIdAndUpdate(req.userId, {
        ...(name ? { name: name.trim() } : {}),
        ...(phone !== undefined ? { phone: phone.trim() } : {}),
        ...(profilePicture !== undefined ? { profilePhoto: profilePicture.trim() } : {})
      });
    }

    const profile = await Profile.findOneAndUpdate(
      { user: req.userId },
      {
        user: req.userId,
        headline: headline?.trim(),
        bio: bio?.trim(),
        skills: Array.isArray(skills) ? skills : [],
        experience: experience?.trim(),
        education: education?.trim(),
        resume: resume?.trim(),
        profilePicture: profilePicture?.trim() || '',
        visible: visible !== false
      },
      { new: true, upsert: true }
    ).populate('user', '-password');

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/candidates', auth, async (req, res) => {
  try {
    if (req.userRole !== 'employer' && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Employer access only' });
    }

    const search = req.query.search?.toLowerCase();
    const profiles = await Profile.find({ visible: true }).populate('user', '-password').sort({ updatedAt: -1 });
    const result = search
      ? profiles.filter((profile) =>
          [profile.headline, profile.bio, profile.experience, profile.education, ...(profile.skills || [])]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(search)
        )
      : profiles;

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/public/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).populate('user', '-password');
    if (!profile || !profile.visible) {
      return res.status(404).json({ message: 'Profile not found or not available' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
