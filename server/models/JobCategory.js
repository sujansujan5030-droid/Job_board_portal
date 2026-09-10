import mongoose from 'mongoose';

const jobCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    icon: { type: String }, // For displaying category icon
    jobCount: { type: Number, default: 0 },
    popularity: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('JobCategory', jobCategorySchema);
