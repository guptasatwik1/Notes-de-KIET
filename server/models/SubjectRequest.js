// notes-de-kiet-backend/models/SubjectRequest.js
import mongoose from 'mongoose';

const SubjectRequestSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: true,
    trim: true,
  },
  dept: {
    type: String,
    required: true,
    trim: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

const SubjectRequest = mongoose.model('SubjectRequest', SubjectRequestSchema);
export default SubjectRequest;