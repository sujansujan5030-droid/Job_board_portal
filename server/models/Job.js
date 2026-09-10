import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    type: { type: String, required: true },
    workplace: { type: String, enum: ['On-site', 'Remote', 'Hybrid'], default: 'On-site' },
    experience: { type: String },
    experienceMin: { type: Number, default: 0 }, // in years
    experienceMax: { type: Number },
    openings: { type: Number, default: 1 },
    industry: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'JobCategory' },
    salary: { type: String },
    salaryMin: { type: Number }, // in LPA or actual amount
    salaryMax: { type: Number },
    salaryType: { type: String, enum: ['LPA', 'PM', 'PY'], default: 'LPA' },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    deadline: { type: Date },
    views: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Create indexes for better query performance
jobSchema.index({ location: 1, status: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ salaryMin: 1, salaryMax: 1 });
jobSchema.index({ experienceMin: 1, experienceMax: 1 });

export default mongoose.model('Job', jobSchema);
