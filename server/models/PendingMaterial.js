// notes-de-kiet-backend/models/PendingMaterial.js
import mongoose from 'mongoose';

const PendingMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  filePath: {
    type: String,
    trim: true,
  },
  fileName: {
    type: String,
    trim: true,
  },
  fileMimeType: {
    type: String,
  },
  fileSize: {
    type: Number,
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
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  type: {
    type: String,
    enum: ['pyq', 'notes', 'assignments', 'syllabus', 'books', 'other', 'video'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    required: true,
  },
  // --- START CRITICAL CHANGE ---
  // Simplify the schema to remove the complex required function
  year: {
    type: Number,
    min: 2000,
    max: 2100,
  },
  teacherName: {
    type: String,
    trim: true,
  },
  videoLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return this.type !== 'video' || /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: 'Video link must be a valid URL.'
    }
  },
  // --- END CRITICAL CHANGE ---
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  ratingCount: {
    type: Number,
    min: 0,
    default: 0
  }
}, {
  timestamps: true,
});

const PendingMaterial = mongoose.model('PendingMaterial', PendingMaterialSchema);
export default PendingMaterial;