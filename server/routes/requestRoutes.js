// notes-de-kiet-backend/routes/requestRoutes.js
import express from 'express';
const router = express.Router();
import SubjectRequest from '../models/SubjectRequest.js';

router.post('/subject', async (req, res) => {
  const { subjectName, dept, semester } = req.body;

  if (!subjectName || !dept || !semester) {
    return res.status(400).json({ message: 'Subject name, department, and semester are required.' });
  }

  try {
    const newRequest = new SubjectRequest({
      subjectName,
      dept,
      semester: parseInt(semester),
    });

    await newRequest.save();

    res.status(201).json({ message: 'Subject request submitted successfully! An admin will review it shortly.' });
  } catch (error) {
    console.error('Error saving subject request:', error);
    res.status(500).json({ message: 'Failed to submit subject request.' });
  }
});

export default router;