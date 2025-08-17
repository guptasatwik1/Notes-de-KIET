// notes-de-kiet-backend/routes/commentRoutes.js
import express from 'express';
const router = express.Router();
import Comment from '../models/Comment.js';

// GET approved comments for the homepage
router.get('/', async (req, res) => {
  try {
    const approvedComments = await Comment.find({ status: 'approved' }).sort('-createdAt');
    res.status(200).json(approvedComments);
  } catch (error) {
    console.error('Error fetching approved comments:', error);
    res.status(500).json({ message: 'Error fetching approved comments.' });
  }
});

// POST a new comment for review
router.post('/add', async (req, res) => {
  try {
    const { name, comment, role } = req.body;
    if (!name || !comment || !role) {
      return res.status(400).json({ message: 'Name, comment, and role are required.' });
    }

    const newComment = new Comment({ name, comment, role, status: 'pending' });
    await newComment.save();

    res.status(202).json({
      message: 'Comment submitted successfully! It will appear on the homepage once approved.',
      comment: newComment
    });
  } catch (error) {
    console.error('Error submitting comment:', error);
    res.status(500).json({ message: 'Failed to submit comment.' });
  }
});

export default router;