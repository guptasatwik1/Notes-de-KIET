// notes-de-kiet-backend/models/Semester.js
import mongoose from 'mongoose';

const SemesterSchema = new mongoose.Schema({
  semesterNumber: { type: Number, required: true, min: 1, max: 8 },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
}, { timestamps: true });

// Ensure unique semester per department
SemesterSchema.index({ semesterNumber: 1, department: 1 }, { unique: true });

const Semester = mongoose.model('Semester', SemesterSchema);
export default Semester;