// notes-de-kiet-backend/routes/semesterRoutes.js
import express from 'express'; // Changed from require()
const router = express.Router();
import Semester from '../models/Semester.js';   // Changed from require(), added .js extension
import Department from '../models/Department.js'; // Changed from require(), added .js extension

// GET semesters for a specific department
router.get('/:deptCode', async (req, res) => {
  try {
    const { deptCode } = req.params;

    const department = await Department.findOne({ code: deptCode.toLowerCase() });
    if (!department) return res.status(404).json({ message: 'Department not found.' });

    const semesters = await Semester.find({ department: department._id }).sort('semesterNumber');
    res.json(semesters);
  } catch (error) {
    console.error('Error fetching semesters:', error);
    res.status(500).json({ message: 'Error fetching semesters.' });
  }
});

// POST a new semester (if you allow dynamic addition)
router.post('/add', async (req, res) => {
  try {
    const { semesterNumber, deptCode } = req.body;

    if (!semesterNumber || !deptCode) {
      return res.status(400).json({ message: 'Semester number and department code are required.' });
    }

    const department = await Department.findOne({ code: deptCode.toLowerCase() });
    if (!department) return res.status(404).json({ message: 'Department not found.' });

    const newSemester = new Semester({
      semesterNumber: parseInt(semesterNumber),
      department: department._id,
    });
    await newSemester.save();
    res.status(201).json({ message: 'Semester added.', semester: newSemester });
  } catch (error) {
    console.error('Error adding semester:', error);
    if (error.code === 11000) { // Duplicate key error
      return res.status(409).json({ message: 'Semester with this number already exists for this department.' });
    }
    res.status(500).json({ message: 'Error adding semester.' });
  }
});

export default router; // This line is correct for ES Modules