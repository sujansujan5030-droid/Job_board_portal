import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    latitude: { type: Number },
    longitude: { type: Number },
    jobCount: { type: Number, default: 0 },
    companyCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Compound index for unique city-state combination
locationSchema.index({ city: 1, state: 1, country: 1 }, { unique: true });

export default mongoose.model('Location', locationSchema);
