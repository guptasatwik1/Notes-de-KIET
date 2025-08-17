// notes-de-kiet-backend/routes/adminSubjectRoutes.js
import express from 'express';
const router = express.Router();
import PendingSubject from '../models/PendingSubject.js';
import Subject from '../models/Subject.js';
import Department from '../models/Department.js';
import Semester from '../models/Semester.js';

// GET all pending subject requests
router.get('/pending', async (req, res) => {
  try {
    const pendingSubjects = await PendingSubject.find({ status: 'pending' })
      .populate('department', 'name code')
      .populate('semester', 'semesterNumber')
      .sort('-createdAt');
    res.status(200).json(pendingSubjects);
  } catch (error) {
    console.error('Error fetching pending subjects:', error);
    res.status(500).json({ message: 'Error fetching pending subjects.' });
  }
});

// APPROVE a pending subject request
router.post('/approve/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const pendingSubject = await PendingSubject.findById(id);
    if (!pendingSubject) {
      return res.status(404).json({ message: 'Pending subject request not found.' });
    }
    if (pendingSubject.status !== 'pending') {
      return res.status(400).json({ message: `Subject request is already ${pendingSubject.status}.` });
    }

    const existingApprovedSubject = await Subject.findOne({
      name: new RegExp(`^${pendingSubject.name}$`, 'i'),
      department: pendingSubject.department,
      semester: pendingSubject.semester,
    });

    if (existingApprovedSubject) {
      pendingSubject.status = 'rejected';
      await pendingSubject.save();
      return res.status(409).json({ message: 'An approved subject with this name already exists. Request marked as rejected.' });
    }

    // Create the actual Subject document
    const newSubject = new Subject({
      name: pendingSubject.name,
      department: pendingSubject.department,
      semester: pendingSubject.semester,
    });
    await newSubject.save();

    // Update the status of the PendingSubject request
    pendingSubject.status = 'approved';
    await pendingSubject.save();

    res.status(200).json({ message: 'Subject approved and added successfully!', subject: newSubject });

  } catch (error) {
    console.error('Error approving subject:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An approved subject with this name already exists. Cannot approve duplicate.' });
    }
    res.status(500).json({ message: 'Error approving subject.' });
  }
});

// REJECT a pending subject request
router.post('/reject/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const pendingSubject = await PendingSubject.findById(id);
    if (!pendingSubject) {
      return res.status(404).json({ message: 'Pending subject request not found.' });
    }
    if (pendingSubject.status !== 'pending') {
      return res.status(400).json({ message: `Subject request is already ${pendingSubject.status}.` });
    }

    pendingSubject.status = 'rejected';
    await pendingSubject.save();

    res.status(200).json({ message: 'Subject request rejected.', pendingSubject });

  } catch (error) {
    console.error('Error rejecting subject:', error);
    res.status(500).json({ message: 'Error rejecting subject.' });
  }
});

export default router;