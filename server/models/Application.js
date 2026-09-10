import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coverLetter: { type: String },
    resume: { type: String },
    interviewDate: { type: Date },
    rejectionReason: { type: String },
    status: { type: String, enum: ['applied', 'shortlisted', 'rejected', 'interview'], default: 'applied' }
  },
  { timestamps: true }
);

export default mongoose.model('Application', applicationSchema);
