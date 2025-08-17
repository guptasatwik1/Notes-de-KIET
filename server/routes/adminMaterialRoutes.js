import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const router = express.Router();
import PendingMaterial from '../models/PendingMaterial.js';
import Material from '../models/Material.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET all pending materials
router.get('/pending', async (req, res) => {
  try {
    const pendingMaterials = await PendingMaterial.find({ status: 'pending' })
      .populate('department', 'name code')
      .populate('semester', 'semesterNumber')
      .populate('subject', 'name')
      .sort('-createdAt');
    res.status(200).json(pendingMaterials);
  } catch (error) {
    console.error('Error fetching pending materials:', error);
    res.status(500).json({ message: 'Error fetching pending materials.' });
  }
});

// APPROVE a pending material
router.post('/approve/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pendingMaterial = await PendingMaterial.findById(id);

    if (!pendingMaterial) {
      return res.status(404).json({ message: 'Pending material not found.' });
    }
    if (pendingMaterial.status !== 'pending') {
      return res.status(400).json({ message: 'Material is not in a pending state.' });
    }

    // Create the final Material document
    const newMaterial = new Material({
      title: pendingMaterial.title,
      description: pendingMaterial.description,
      filePath: pendingMaterial.filePath,
      fileName: pendingMaterial.fileName,
      fileMimeType: pendingMaterial.fileMimeType,
      fileSize: pendingMaterial.fileSize,
      department: pendingMaterial.department,
      semester: pendingMaterial.semester,
      subject: pendingMaterial.subject,
      type: pendingMaterial.type,
    });
    await newMaterial.save();

    // Update the status of the pending material
    pendingMaterial.status = 'approved';
    await pendingMaterial.save();

    res.status(200).json({ message: 'Material approved and added successfully!', material: newMaterial });
  } catch (error) {
    console.error('Error approving material:', error);
    res.status(500).json({ message: 'Error approving material.' });
  }
});

// REJECT a pending material
router.post('/reject/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pendingMaterial = await PendingMaterial.findById(id);

    if (!pendingMaterial) {
      return res.status(404).json({ message: 'Pending material not found.' });
    }
    if (pendingMaterial.status !== 'pending') {
      return res.status(400).json({ message: 'Material is not in a pending state.' });
    }

    pendingMaterial.status = 'rejected';
    await pendingMaterial.save();

    res.status(200).json({ message: 'Material request rejected.', pendingMaterial });
  } catch (error) {
    console.error('Error rejecting material:', error);
    res.status(500).json({ message: 'Error rejecting material.' });
  }
});

// --- START CRITICAL CHANGE ---
// New bulk approval endpoint
router.post('/approve-multiple', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'An array of material IDs is required.' });
    }

    const approvedCount = 0;
    const rejectedCount = 0;

    for (const id of ids) {
      const pendingMaterial = await PendingMaterial.findById(id);

      if (!pendingMaterial || pendingMaterial.status !== 'pending') {
        continue; // Skip if material is not found or not pending
      }

      // Create the final Material document
      const newMaterial = new Material({
        title: pendingMaterial.title,
        description: pendingMaterial.description,
        filePath: pendingMaterial.filePath,
        fileName: pendingMaterial.fileName,
        fileMimeType: pendingMaterial.fileMimeType,
        fileSize: pendingMaterial.fileSize,
        department: pendingMaterial.department,
        semester: pendingMaterial.semester,
        subject: pendingMaterial.subject,
        type: pendingMaterial.type,
      });
      await newMaterial.save();

      // Update the status of the pending material
      pendingMaterial.status = 'approved';
      await pendingMaterial.save();
      approvedCount++;
    }

    res.status(200).json({
      message: `${approvedCount} materials approved successfully!`,
      approvedCount,
    });
  } catch (error) {
    console.error('Error approving materials:', error);
    res.status(500).json({ message: 'Error approving materials.' });
  }
});
// --- END CRITICAL CHANGE ---

export default router;