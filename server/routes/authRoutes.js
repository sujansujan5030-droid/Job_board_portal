import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Company from '../models/Company.js';

const router = express.Router();

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  companyName: user.companyName,
  profileComplete: user.profileComplete,
  resume: user.resume
});

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

router.post('/register', async (req, res) => {
  try {
    const { name, password, role = 'jobseeker', companyName, phone } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!name?.trim() || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    if (!['jobseeker', 'employer'].includes(role)) {
      return res.status(400).json({ message: 'Choose a valid account type' });
    }

    if (role === 'employer' && !companyName?.trim()) {
      return res.status(400).json({ message: 'Company name is required for employers' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email,
      password: hashedPassword,
      role,
      companyName: role === 'employer' ? companyName.trim() : '',
      phone: phone?.trim(),
      profileComplete: role === 'employer' ? Boolean(companyName?.trim()) : Boolean(phone?.trim())
    });

    if (role === 'employer' && companyName?.trim()) {
      await Company.findOneAndUpdate(
        { employer: user._id },
        { name: companyName.trim(), employer: user._id, verified: false },
        { upsert: true, new: true }
      );
    }

    const token = createToken(user);
    res.cookie('token', token, cookieOptions).status(201).json({ token, user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = createToken(user);
    res.cookie('token', token, cookieOptions).json({ token, user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token', cookieOptions).json({ message: 'Logged out' });
});

router.get('/me', async (req, res) => {
  try {
    const bearerToken = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;
    const token = req.cookies.token || bearerToken;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user: publicUser(user) });
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

export default router;
