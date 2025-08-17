// notes-de-kiet-backend/models/Department.js
import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, lowercase: true, trim: true }, // e.g., 'cs', 'ece'
}, { timestamps: true });

const Department = mongoose.model('Department', DepartmentSchema);
export default Department;