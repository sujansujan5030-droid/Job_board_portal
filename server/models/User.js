import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['jobseeker', 'employer', 'admin'], default: 'jobseeker' },
    phone: { type: String },
    companyName: { type: String },
    profileComplete: { type: Boolean, default: false },
    profilePhoto: { type: String },
    bio: { type: String },
    experience: { type: Number, default: 0 }, // in years
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    currentLocation: { type: String },
    skills: { type: [String], default: [] },
    qualifications: [
      {
        degree: String,
        institution: String,
        year: Number
      }
    ],
    workExperience: [
      {
        company: String,
        designation: String,
        startDate: Date,
        endDate: Date,
        currentlyWorking: Boolean,
        description: String
      }
    ],
    resume: { type: String },
    preferredJobType: [String],
    preferredLocations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }],
    expectedSalary: {
      min: Number,
      max: Number
    }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
