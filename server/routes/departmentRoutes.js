// notes-de-kiet-backend/routes/departmentRoutes.js
import express from 'express'; // Changed from require()
const router = express.Router();
import Department from '../models/Department.js'; // Changed from require(), added .js extension

// GET all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find({}).sort('name');
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Error fetching departments.' });
  }
});

// POST a new department (if you have an admin panel for this)
// This example assumes you might manually add departments or have a specific route for it
router.post('/', async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: 'Department name and code are required.' });
    }

    const newDepartment = new Department({
      name,
      code: code.toLowerCase(),
    });
    await newDepartment.save();
    res.status(201).json({ message: 'Department added.', department: newDepartment });
  } catch (error) {
    console.error('Error adding department:', error);
    if (error.code === 11000) { // Duplicate key error
      return res.status(409).json({ message: 'Department with this code already exists.' });
    }
    res.status(500).json({ message: 'Error adding department.' });
  }
});

export default router; // This line is correct for ES Modules