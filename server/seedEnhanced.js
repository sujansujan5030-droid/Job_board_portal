import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Company from './models/Company.js';
import Job from './models/Job.js';
import Profile from './models/Profile.js';
import Location from './models/Location.js';
import JobCategory from './models/JobCategory.js';

dotenv.config();

const password = await bcrypt.hash('Demo@1234', 10);

// Define locations
const locations = [
  { city: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946 },
  { city: 'Pune', state: 'Maharashtra', country: 'India', latitude: 18.5204, longitude: 73.8567 },
  { city: 'Delhi', state: 'Delhi', country: 'India', latitude: 28.7041, longitude: 77.1025 },
  { city: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777 },
  { city: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.3850, longitude: 78.4867 },
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707 },
  { city: 'Kolkata', state: 'West Bengal', country: 'India', latitude: 22.5726, longitude: 88.3639 },
  { city: 'Ahmedabad', state: 'Gujarat', country: 'India', latitude: 23.0225, longitude: 72.5714 },
  { city: 'Jaipur', state: 'Rajasthan', country: 'India', latitude: 26.9124, longitude: 75.7873 },
  { city: 'Noida', state: 'Uttar Pradesh', country: 'India', latitude: 28.5355, longitude: 77.3910 }
];

// Define job categories
const categories = [
  { name: 'Software Development', description: 'IT, Web, Mobile Development', icon: '💻' },
  { name: 'Data Science & Analytics', description: 'Data Science, ML, Analytics', icon: '📊' },
  { name: 'Design & UX', description: 'UI/UX Design, Graphic Design', icon: '🎨' },
  { name: 'Sales & Marketing', description: 'Sales, Marketing, Business Development', icon: '📈' },
  { name: 'Human Resources', description: 'HR, Recruiting, Training', icon: '👥' },
  { name: 'Finance & Accounting', description: 'Finance, Accounting, Audit', icon: '💰' },
  { name: 'Product Management', description: 'Product Management, Strategy', icon: '🎯' },
  { name: 'DevOps & Infrastructure', description: 'DevOps, Cloud, Infrastructure', icon: '⚙️' }
];

const users = [
  { name: 'Aarav Candidate', email: 'candidate@jobboard.com', role: 'jobseeker', phone: '9876543210' },
  { name: 'Priya Recruiter', email: 'employer@jobboard.com', role: 'employer', phone: '9876500000', companyName: 'NexaTech Solutions' },
  { name: 'Admin User', email: 'admin@jobboard.com', role: 'admin', phone: '9000000000' }
];

const jobs = [
  {
    title: 'Senior Frontend React Developer',
    company: 'NexaTech Solutions',
    location: 'Bengaluru',
    type: 'Full Time',
    workplace: 'Hybrid',
    experience: '2-4 years',
    experienceMin: 2,
    experienceMax: 4,
    openings: 3,
    industry: 'Software Services',
    salary: 'Rs 8 LPA - Rs 14 LPA',
    salaryMin: 8,
    salaryMax: 14,
    salaryType: 'LPA',
    description: 'Build responsive customer-facing dashboards, collaborate with product teams, and ship reusable React components. We are looking for talented React developers to join our growing team.',
    skills: ['React', 'JavaScript', 'CSS', 'REST APIs', 'TypeScript'],
    requirements: ['Strong React fundamentals', 'Experience with API integration', 'Good UI problem solving', 'Git proficiency'],
    benefits: ['Health insurance', 'Hybrid work', 'Learning budget', 'Stock options']
  },
  {
    title: 'MERN Stack Engineer',
    company: 'NexaTech Solutions',
    location: 'Pune',
    type: 'Full Time',
    workplace: 'Remote',
    experience: '1-3 years',
    experienceMin: 1,
    experienceMax: 3,
    openings: 2,
    industry: 'SaaS',
    salary: 'Rs 7 LPA - Rs 12 LPA',
    salaryMin: 7,
    salaryMax: 12,
    salaryType: 'LPA',
    description: 'Work across React, Node.js, Express, and MongoDB to build product features used by hiring teams. Join our engineering team and help us scale.',
    skills: ['MongoDB', 'Express', 'React', 'Node.js', 'JavaScript'],
    requirements: ['MERN project experience', 'Understanding of auth flows', 'Clean coding habits', 'Database design knowledge'],
    benefits: ['Remote work', 'Performance bonus', 'Flexible hours', 'Career growth']
  },
  {
    title: 'Data Scientist - Machine Learning',
    company: 'NexaTech Solutions',
    location: 'Bengaluru',
    type: 'Full Time',
    workplace: 'On-site',
    experience: '2-5 years',
    experienceMin: 2,
    experienceMax: 5,
    openings: 2,
    industry: 'Software Services',
    salary: 'Rs 10 LPA - Rs 18 LPA',
    salaryMin: 10,
    salaryMax: 18,
    salaryType: 'LPA',
    description: 'Build ML models for recommendation systems and data pipelines. Work with large datasets and cutting-edge technologies.',
    skills: ['Python', 'Machine Learning', 'SQL', 'Data Analysis', 'TensorFlow'],
    requirements: ['ML model development', 'Python proficiency', 'Statistics knowledge', 'Big data experience'],
    benefits: ['Health insurance', 'Learning opportunities', 'Competitive salary', 'Flexible work']
  },
  {
    title: 'HR Talent Acquisition Executive',
    company: 'PeopleFirst HR',
    location: 'Delhi',
    type: 'Full Time',
    workplace: 'On-site',
    experience: '0-2 years',
    experienceMin: 0,
    experienceMax: 2,
    openings: 4,
    industry: 'Human Resources',
    salary: 'Rs 3 LPA - Rs 5 LPA',
    salaryMin: 3,
    salaryMax: 5,
    salaryType: 'LPA',
    description: 'Source candidates, coordinate interviews, manage job postings, and support end-to-end recruitment operations. Great opportunity for freshers.',
    skills: ['Recruiting', 'Communication', 'Screening', 'ATS'],
    requirements: ['Good communication', 'Recruitment interest', 'MS Office basics', 'Attention to detail'],
    benefits: ['Incentives', 'Training', 'Career growth', 'Health coverage']
  },
  {
    title: 'DevOps Engineer',
    company: 'CloudTech Solutions',
    location: 'Hyderabad',
    type: 'Full Time',
    workplace: 'Hybrid',
    experience: '2-4 years',
    experienceMin: 2,
    experienceMax: 4,
    openings: 2,
    industry: 'Cloud Services',
    salary: 'Rs 9 LPA - Rs 15 LPA',
    salaryMin: 9,
    salaryMax: 15,
    salaryType: 'LPA',
    description: 'Manage infrastructure, CI/CD pipelines, and cloud deployments. Work with Kubernetes and modern DevOps tools.',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD'],
    requirements: ['Docker & Kubernetes', 'AWS experience', 'Linux administration', 'Infrastructure automation'],
    benefits: ['Stock options', 'Health insurance', 'Learning budget', 'Remote flexibility']
  },
  {
    title: 'Product Manager - B2B SaaS',
    company: 'EnterpriseHub',
    location: 'Bengaluru',
    type: 'Full Time',
    workplace: 'Hybrid',
    experience: '3-6 years',
    experienceMin: 3,
    experienceMax: 6,
    openings: 1,
    industry: 'SaaS',
    salary: 'Rs 15 LPA - Rs 25 LPA',
    salaryMin: 15,
    salaryMax: 25,
    salaryType: 'LPA',
    description: 'Lead product strategy for our B2B SaaS platform. Collaborate with engineering, design, and sales teams.',
    skills: ['Product Strategy', 'Analytics', 'User Research', 'Roadmapping'],
    requirements: ['B2B SaaS experience', 'Data-driven approach', 'Communication skills', 'Cross-functional collaboration'],
    benefits: ['Competitive salary', 'Stock options', 'Leadership growth', 'Flexible work']
  },
  {
    title: 'UX/UI Designer',
    company: 'DesignStudio',
    location: 'Mumbai',
    type: 'Full Time',
    workplace: 'Remote',
    experience: '1-3 years',
    experienceMin: 1,
    experienceMax: 3,
    openings: 3,
    industry: 'Design Services',
    salary: 'Rs 5 LPA - Rs 10 LPA',
    salaryMin: 5,
    salaryMax: 10,
    salaryType: 'LPA',
    description: 'Design beautiful and intuitive user interfaces. Work on diverse projects across web and mobile platforms.',
    skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'CSS'],
    requirements: ['Strong design portfolio', 'Figma proficiency', 'UX principles', 'Communication skills'],
    benefits: ['Remote work', 'Creative freedom', 'Health insurance', 'Professional development']
  },
  {
    title: 'Business Development Executive',
    company: 'GrowthCorp',
    location: 'Pune',
    type: 'Full Time',
    workplace: 'Hybrid',
    experience: '2-4 years',
    experienceMin: 2,
    experienceMax: 4,
    openings: 2,
    industry: 'Business Services',
    salary: 'Rs 6 LPA - Rs 11 LPA',
    salaryMin: 6,
    salaryMax: 11,
    salaryType: 'LPA',
    description: 'Develop business strategies, manage client relationships, and drive revenue growth.',
    skills: ['Sales', 'Negotiation', 'CRM', 'Client Management', 'Strategic Planning'],
    requirements: ['B2B sales experience', 'Negotiation skills', 'CRM familiarity', 'Target-driven mindset'],
    benefits: ['Performance bonus', 'Travel allowance', 'Commission structure', 'Health coverage']
  }
];

try {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
  await mongoose.connect(process.env.MONGO_URI);

  console.log('Seeding locations...');
  const createdLocations = {};
  for (const loc of locations) {
    const location = await Location.findOneAndUpdate(
      { city: loc.city, state: loc.state, country: loc.country },
      loc,
      { upsert: true, new: true }
    );
    createdLocations[loc.city] = location;
  }

  console.log('Seeding categories...');
  const createdCategories = {};
  for (const cat of categories) {
    const category = await JobCategory.findOneAndUpdate(
      { name: cat.name },
      cat,
      { upsert: true, new: true }
    );
    createdCategories[cat.name] = category;
  }

  console.log('Seeding users...');
  const createdUsers = {};
  for (const user of users) {
    createdUsers[user.role] = await User.findOneAndUpdate(
      { email: user.email },
      { ...user, password, profileComplete: true },
      { upsert: true, new: true }
    );
  }

  console.log('Seeding companies...');
  const createdCompanies = {};

  createdCompanies['NexaTech Solutions'] = await Company.findOneAndUpdate(
    { name: 'NexaTech Solutions' },
    {
      name: 'NexaTech Solutions',
      employer: createdUsers.employer._id,
      description: 'A product engineering company building scalable hiring, analytics, and enterprise workflow platforms.',
      website: 'https://nexatech.example.com',
      location: 'Bengaluru',
      locations: [createdLocations['Bengaluru']._id, createdLocations['Pune']._id],
      industry: 'Software Services',
      companySize: 'Large',
      employeeCount: 500,
      tagline: 'Building the future of work',
      verified: true,
      rating: 4.5,
      reviews: 128
    },
    { upsert: true, new: true }
  );

  createdCompanies['PeopleFirst HR'] = await Company.findOneAndUpdate(
    { name: 'PeopleFirst HR' },
    {
      name: 'PeopleFirst HR',
      employer: createdUsers.employer._id,
      description: 'Recruitment and staffing firm helping Indian companies hire faster across business roles.',
      location: 'Delhi',
      locations: [createdLocations['Delhi']._id],
      industry: 'Human Resources',
      companySize: 'Medium',
      employeeCount: 150,
      tagline: 'We connect talent with opportunity',
      verified: true,
      rating: 4.2,
      reviews: 85
    },
    { upsert: true, new: true }
  );

  createdCompanies['CloudTech Solutions'] = await Company.findOneAndUpdate(
    { name: 'CloudTech Solutions' },
    {
      name: 'CloudTech Solutions',
      employer: createdUsers.employer._id,
      description: 'Cloud infrastructure and DevOps solutions provider.',
      website: 'https://cloudtech.example.com',
      location: 'Hyderabad',
      locations: [createdLocations['Hyderabad']._id],
      industry: 'Cloud Services',
      companySize: 'Medium',
      employeeCount: 200,
      tagline: 'Cloud Made Simple',
      verified: true,
      rating: 4.4,
      reviews: 95
    },
    { upsert: true, new: true }
  );

  console.log('Seeding jobs...');
  const categoryMap = {
    'Senior Frontend React Developer': 'Software Development',
    'MERN Stack Engineer': 'Software Development',
    'Data Scientist - Machine Learning': 'Data Science & Analytics',
    'HR Talent Acquisition Executive': 'Human Resources',
    'DevOps Engineer': 'DevOps & Infrastructure',
    'Product Manager - B2B SaaS': 'Product Management',
    'UX/UI Designer': 'Design & UX',
    'Business Development Executive': 'Sales & Marketing'
  };

  for (const job of jobs) {
    const locationId = createdLocations[job.location]?._id;
    const categoryName = categoryMap[job.title];
    const categoryId = createdCategories[categoryName]?._id;

    await Job.findOneAndUpdate(
      { title: job.title, company: job.company },
      {
        ...job,
        locationId,
        category: categoryId,
        postedBy: createdUsers.employer._id,
        status: 'active',
        companyId: createdCompanies[job.company]?._id,
        featured: Math.random() > 0.6 // 40% featured
      },
      { upsert: true, new: true }
    );
  }

  // Update location job counts
  console.log('Updating location statistics...');
  for (const city in createdLocations) {
    const jobCount = await Job.countDocuments({ location: city });
    const companyCount = await Company.countDocuments({ location: city });
    await Location.findByIdAndUpdate(
      createdLocations[city]._id,
      { jobCount, companyCount },
      { new: true }
    );
  }

  // Update category job counts
  console.log('Updating category statistics...');
  for (const catName in createdCategories) {
    const jobCount = await Job.countDocuments({ category: createdCategories[catName]._id });
    await JobCategory.findByIdAndUpdate(
      createdCategories[catName]._id,
      { jobCount },
      { new: true }
    );
  }

  await Profile.findOneAndUpdate(
    { user: createdUsers.jobseeker._id },
    {
      user: createdUsers.jobseeker._id,
      headline: 'MERN Stack Developer looking for frontend roles',
      bio: 'Hands-on developer with React, Node.js, MongoDB, and clean UI implementation experience.',
      skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'TypeScript'],
      experience: 'Built full-stack job board and dashboard projects.',
      education: 'B.Tech Computer Science',
      visible: true
    },
    { upsert: true, new: true }
  );

  console.log('✅ Demo data seeded successfully');
  console.log('\n📝 Login Credentials:');
  console.log('Candidate: candidate@jobboard.com / Demo@1234');
  console.log('Employer: employer@jobboard.com / Demo@1234');
  console.log('Admin: admin@jobboard.com / Demo@1234');
} catch (error) {
  console.error('❌ Seeding error:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
