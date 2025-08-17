// notes-de-kiet-backend/models/Comment.js
import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  },
  role: { // Student's role, e.g., '3rd Year, CSE'
    type: String,
    required: true,
    trim: true,
  },
  status: { // For moderation
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    required: true,
  }
}, {
  timestamps: true,
});

const Comment = mongoose.model('Comment', CommentSchema);
export default Comment;