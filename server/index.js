import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import savedJobRoutes from './routes/savedJobRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import { initSocket } from './socket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Job Board API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/saved-jobs', savedJobRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/categories', categoryRoutes);

const startServer = async () => {
  try {
    initSocket(server);

    if (!process.env.MONGO_URI) {
      console.warn('MONGO_URI is not set. Starting without DB connection.');
      server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
