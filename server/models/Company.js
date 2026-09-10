import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String },
    website: { type: String },
    logo: { type: String },
    location: { type: String },
    locations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }], // Multiple locations
    industry: { type: String },
    companySize: { type: String, enum: ['Startup', 'Small', 'Medium', 'Large', 'Enterprise'], default: 'Medium' },
    foundedYear: { type: Number },
    employeeCount: { type: Number },
    tagline: { type: String },
    socialLinks: {
      linkedin: String,
      twitter: String,
      facebook: String
    },
    verified: { type: Boolean, default: false },
    jobCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('Company', companySchema);
