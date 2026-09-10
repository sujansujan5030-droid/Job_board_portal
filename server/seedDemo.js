import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Company from './models/Company.js';
import Job from './models/Job.js';
import Profile from './models/Profile.js';

dotenv.config();

const password = await bcrypt.hash('Demo@1234', 10);

const users = [
  { name: 'Aarav Candidate', email: 'candidate@jobboard.com', role: 'jobseeker', phone: '9876543210' },
  { name: 'Priya Recruiter', email: 'employer@jobboard.com', role: 'employer', phone: '9876500000', companyName: 'NexaTech Solutions' },
  { name: 'Admin User', email: 'admin@jobboard.com', role: 'admin', phone: '9000000000' }
];

const jobs = [
  {
    title: 'Frontend React Developer',
    company: 'NexaTech Solutions',
    location: 'Bengaluru',
    type: 'Full Time',
    workplace: 'Hybrid',
    experience: '2-4 years',
    openings: 3,
    industry: 'Software Services',
    salary: 'Rs 8 LPA - Rs 14 LPA',
    description: 'Build responsive customer-facing dashboards, collaborate with product teams, and ship reusable React components.',
    skills: ['React', 'JavaScript', 'CSS', 'REST APIs'],
    requirements: ['Strong React fundamentals', 'Experience with API integration', 'Good UI problem solving'],
    benefits: ['Health insurance', 'Hybrid work', 'Learning budget']
  },
  {
    title: 'MERN Stack Engineer',
    company: 'NexaTech Solutions',
    location: 'Pune',
    type: 'Full Time',
    workplace: 'Remote',
    experience: '1-3 years',
    openings: 2,
    industry: 'SaaS',
    salary: 'Rs 7 LPA - Rs 12 LPA',
    description: 'Work across React, Node.js, Express, and MongoDB to build product features used by hiring teams.',
    skills: ['MongoDB', 'Express', 'React', 'Node.js'],
    requirements: ['MERN project experience', 'Understanding of auth flows', 'Clean coding habits'],
    benefits: ['Remote work', 'Performance bonus', 'Flexible hours']
  },
  {
    title: 'HR Talent Acquisition Executive',
    company: 'PeopleFirst HR',
    location: 'Delhi NCR',
    type: 'Full Time',
    workplace: 'On-site',
    experience: '0-2 years',
    openings: 4,
    industry: 'Human Resources',
    salary: 'Rs 3 LPA - Rs 5 LPA',
    description: 'Source candidates, coordinate interviews, manage job postings, and support end-to-end recruitment operations.',
    skills: ['Recruiting', 'Communication', 'Screening', 'ATS'],
    requirements: ['Good communication', 'Recruitment interest', 'MS Office basics'],
    benefits: ['Incentives', 'Training', 'Career growth']
  }
];

try {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
  await mongoose.connect(process.env.MONGO_URI);

  const createdUsers = {};
  for (const user of users) {
    createdUsers[user.role] = await User.findOneAndUpdate(
      { email: user.email },
      { ...user, password, profileComplete: true },
      { upsert: true, new: true }
    );
  }

  const createdCompanies = {};

  createdCompanies['NexaTech Solutions'] = await Company.findOneAndUpdate(
    { name: 'NexaTech Solutions' },
    {
      name: 'NexaTech Solutions',
      employer: createdUsers.employer._id,
      description: 'A product engineering company building scalable hiring, analytics, and enterprise workflow platforms.',
      website: 'https://example.com',
      location: 'Bengaluru',
      verified: true
    },
    { upsert: true, new: true }
  );

  createdCompanies['PeopleFirst HR'] = await Company.findOneAndUpdate(
    { name: 'PeopleFirst HR' },
    {
      name: 'PeopleFirst HR',
      employer: createdUsers.employer._id,
      description: 'Recruitment and staffing firm helping Indian companies hire faster across business roles.',
      location: 'Delhi NCR',
      verified: true
    },
    { upsert: true, new: true }
  );

  for (const job of jobs) {
    await Job.findOneAndUpdate(
      { title: job.title, company: job.company },
      {
        ...job,
        postedBy: createdUsers.employer._id,
        status: 'active',
        companyId: createdCompanies[job.company]?._id
      },
      { upsert: true, new: true }
    );
  }

  await Profile.findOneAndUpdate(
    { user: createdUsers.jobseeker._id },
    {
      user: createdUsers.jobseeker._id,
      headline: 'MERN Stack Developer looking for frontend roles',
      bio: 'Hands-on developer with React, Node.js, MongoDB, and clean UI implementation experience.',
      skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
      experience: 'Built full-stack job board and dashboard projects.',
      education: 'B.Tech Computer Science',
      visible: true
    },
    { upsert: true, new: true }
  );

  console.log('Demo data ready');
  console.log('Candidate: candidate@jobboard.com / Demo@1234');
  console.log('Employer: employer@jobboard.com / Demo@1234');
  console.log('Admin: admin@jobboard.com / Demo@1234');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
