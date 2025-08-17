// notes-de-kiet-backend/models/PendingSubject.js
import mongoose from 'mongoose';

const PendingSubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    required: true,
  }
}, {
  timestamps: true
});

const PendingSubject = mongoose.model('PendingSubject', PendingSubjectSchema);
export default PendingSubject;