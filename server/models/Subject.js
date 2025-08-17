// notes-de-kiet-backend/models/Subject.js
import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema({
  name: { // The display name of the subject (e.g., "Data Structures")
    type: String,
    required: true,
    trim: true,
  },
  department: { // Reference to the Department model
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  semester: { // Reference to the Semester model
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true,
  },
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Ensure a subject name is unique within a specific department and semester
SubjectSchema.index({ name: 1, department: 1, semester: 1 }, { unique: true });

const Subject = mongoose.model('Subject', SubjectSchema);

export default Subject;