import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String },
    skills: { type: [String], default: [] },
    experience: { type: String },
    education: { type: String },
    resume: { type: String },
    profilePicture: { type: String },
    headline: { type: String },
    visible: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('Profile', profileSchema);
