import express from 'express';
const router = express.Router();
import path from 'path';
import { fileURLToPath } from 'url';
import upload from '../config/multerConfig.js';
import Material from '../models/Material.js';
import Department from '../models/Department.js';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';
import PendingMaterial from '../models/PendingMaterial.js';
import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, description, dept, semester, subject, resourceType, year, teacherName, videoLink } = req.body;

    if (!req.file && resourceType !== 'video' && resourceType !== 'books') {
      return res.status(400).json({ message: 'A file is required for this resource type.' });
    }
    
    if (resourceType === 'video' && !videoLink) {
      return res.status(400).json({ message: 'A video link is required for video resources.' });
    }

    const filePath = req.file ? `/uploads/${req.file.filename}` : null;
    const fileName = req.file ? req.file.originalname : null;
    const fileMimeType = req.file ? req.file.mimetype : null;
    const fileSize = req.file ? req.file.size : null;

    if (!title || !dept || !semester || !subject || !resourceType) {
      return res.status(400).json({ message: 'Title, department, semester, subject, and resource type are required.' });
    }

    const department = await Department.findOne({ code: dept.toLowerCase() });
    if (!department) return res.status(404).json({ message: 'Department not found.' });

    const semesterDoc = await Semester.findOne({
      department: department._id,
      semesterNumber: parseInt(semester)
    });
    if (!semesterDoc) return res.status(404).json({ message: 'Semester not found for this department.' });

    const subjectDoc = await Subject.findOne({
      department: department._id,
      semester: semesterDoc._id,
      name: { $regex: new RegExp(`^${subject.replace(/-/g, ' ')}$`, 'i') }
    });
    if (!subjectDoc) return res.status(404).json({ message: 'Subject not found for this department and semester.' });

    const newPendingMaterial = new PendingMaterial({
      title,
      description,
      filePath,
      fileName,
      fileMimeType,
      fileSize,
      department: department._id,
      semester: semesterDoc._id,
      subject: subjectDoc._id,
      type: resourceType,
      status: 'pending',
      year,
      teacherName,
      videoLink,
    });
    await newPendingMaterial.save();
    res.status(202).json({ message: 'Material submitted for review. It will be live once approved.' });

  } catch (error) {
    console.error('Error uploading material:', error);
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error uploading material.' });
  }
});

router.post('/rate/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (rating === undefined || rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'A rating between 0 and 5 is required.' });
    }

    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found.' });
    }

    const newRatingCount = material.ratingCount + 1;
    const newAverageRating = 
      ((material.averageRating * material.ratingCount) + rating) / newRatingCount;

    material.averageRating = newAverageRating;
    material.ratingCount = newRatingCount;
    await material.save();

    res.status(200).json({
      message: 'Rating submitted successfully!',
      material: {
        _id: material._id,
        averageRating: material.averageRating,
        ratingCount: material.ratingCount
      }
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ message: 'Error submitting rating.' });
  }
});

router.get('/view/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material || !material.filePath) {
        return res.status(404).json({ message: 'File not found.' });
    }
    
    const correctRelativePath = material.filePath.startsWith('/') 
      ? material.filePath.substring(1) 
      : material.filePath;
      
    const absoluteFilePath = path.join(__dirname, '..', correctRelativePath);

    if (fs.existsSync(absoluteFilePath)) {
      
      let contentType = material.fileMimeType;
      if (!contentType && material.fileName) {
        const fileExtension = path.extname(material.fileName).toLowerCase();
        if (fileExtension === '.pdf') {
          contentType = 'application/pdf';
        } else if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
          contentType = 'image/jpeg';
        } else if (fileExtension === '.png') {
          contentType = 'image/png';
        } else if (fileExtension === '.txt') {
            contentType = 'text/plain';
        }
      }

      res.setHeader('Content-Type', contentType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${material.fileName}"`);

      const fileStream = fs.createReadStream(absoluteFilePath);
      fileStream.pipe(res);

    } else {
      console.error(`File does not exist on disk at: ${absoluteFilePath}`);
      return res.status(404).json({ message: 'File does not exist on server disk.' });
    }

  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ message: 'Error serving file.' });
  }
});

router.get('/:deptCode/:semesterNumber/:subjectName/:resourceType', async (req, res) => {
  try {
    const { deptCode, semesterNumber, subjectName, resourceType } = req.params;

    const department = await Department.findOne({ code: deptCode.toLowerCase() });
    if (!department) return res.status(404).json({ message: 'Department not found.' });

    const semester = await Semester.findOne({
      department: department._id,
      semesterNumber: parseInt(semesterNumber)
    });
    if (!semester) return res.status(404).json({ message: 'Semester not found for this department.' });

    const subject = await Subject.findOne({
      department: department._id,
      semester: semester._id,
      name: { $regex: new RegExp(`^${subjectName.replace(/-/g, ' ')}$`, 'i') }
    });
    if (!subject) return res.status(404).json({ message: 'Subject not found for this department and semester.' });

    const query = {
      department: department._id,
      semester: semester._id,
      subject: subject._id,
      type: resourceType,
    };

    if (resourceType === 'pyq') {
      const pyqsByYear = await Material.aggregate([
        { $match: query },
        { $group: {
            _id: '$year',
            materials: { $push: '$$ROOT' }
          }
        },
        { $sort: { _id: -1 } }
      ]);
      res.json(pyqsByYear);
    } else {
      const materials = await Material.find(query).sort('title');
      res.json(materials);
    }

  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ message: 'Error fetching materials.' });
  }
});

export default router;