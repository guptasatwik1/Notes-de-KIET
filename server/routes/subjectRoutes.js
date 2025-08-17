// notes-de-kiet-backend/routes/subjectRoutes.js
import express from 'express';
const router = express.Router();
import Subject from '../models/Subject.js';
import Department from '../models/Department.js';
import Semester from '../models/Semester.js';
import PendingSubject from '../models/PendingSubject.js';

// GET subjects for a specific department and semester (accessible to all)
router.get('/:deptCode/:semesterNumber', async (req, res) => {
  try {
    const { deptCode, semesterNumber } = req.params;

    const department = await Department.findOne({ code: deptCode.toLowerCase() });
    if (!department) return res.status(404).json({ message: 'Department not found.' });

    const semester = await Semester.findOne({
      department: department._id,
      semesterNumber: parseInt(semesterNumber)
    });
    if (!semester) return res.status(404).json({ message: 'Semester not found for this department.' });

    const subjects = await Subject.find({ department: department._id, semester: semester._id }).sort('name');
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Error fetching subjects.' });
  }
});

// POST a new subject request (accessible to all users now)
router.post('/submit', async (req, res) => {
  try {
    const { name, deptCode, semesterNumber } = req.body;

    if (!name || !deptCode || !semesterNumber) {
      return res.status(400).json({ message: 'Subject name, department code, and semester number are required.' });
    }

    const department = await Department.findOne({ code: deptCode.toLowerCase() });
    if (!department) return res.status(404).json({ message: 'Department not found.' });

    const semester = await Semester.findOne({
      department: department._id,
      semesterNumber: parseInt(semesterNumber)
    });
    if (!semester) return res.status(404).json({ message: 'Semester not found for this department.' });

    const existingApprovedSubject = await Subject.findOne({
        name: new RegExp(`^${name}$`, 'i'),
        department: department._id,
        semester: semester._id,
    });

    if (existingApprovedSubject) {
        return res.status(409).json({ message: 'A subject with this name already exists for this semester and department.' });
    }

    const existingPendingRequest = await PendingSubject.findOne({
        name: new RegExp(`^${name}$`, 'i'),
        department: department._id,
        semester: semester._id,
        status: 'pending'
    });

    if (existingPendingRequest) {
        return res.status(409).json({ message: 'This subject request is already pending review.' });
    }

    const newPendingSubject = new PendingSubject({
      name,
      department: department._id,
      semester: semester._id,
      status: 'pending'
    });
    await newPendingSubject.save();

    res.status(202).json({
      message: 'Subject submitted for review. It will appear once approved by an administrator.',
      pendingSubject: newPendingSubject
    });

  } catch (error) {
    console.error('Error submitting subject request:', error);
    res.status(500).json({ message: 'Error submitting subject request.' });
  }
});

// POST a new subject (Admin Only - direct addition)
router.post('/add', async (req, res) => {
  try {
    const { name, deptCode, semesterNumber } = req.body;

    if (!name || !deptCode || !semesterNumber) {
      return res.status(400).json({ message: 'Subject name, department code, and semester number are required.' });
    }

    const department = await Department.findOne({ code: deptCode.toLowerCase() });
    if (!department) return res.status(404).json({ message: 'Department not found.' });

    const semester = await Semester.findOne({
      department: department._id,
      semesterNumber: parseInt(semesterNumber)
    });
    if (!semester) return res.status(404).json({ message: 'Semester not found for this department.' });

    const newSubject = new Subject({
      name,
      department: department._id,
      semester: semester._id,
    });
    await newSubject.save();
    res.status(201).json({ message: 'Subject added.', subject: newSubject });

  } catch (error) {
    console.error('Error adding subject:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Subject with this name already exists for this semester and department.' });
    }
    res.status(500).json({ message: 'Error adding subject.' });
  }
});

export default router;