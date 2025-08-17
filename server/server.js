import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Import all your Models ---
import Department from './models/Department.js';
import Semester from './models/Semester.js';
import Subject from './models/Subject.js';
import Material from './models/Material.js';
import PendingMaterial from './models/PendingMaterial.js';
import Comment from './models/Comment.js';
import PendingSubject from './models/PendingSubject.js';

// --- Import all your Routes ---
import departmentRoutes from './routes/departmentRoutes.js';
import semesterRoutes from './routes/semesterRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import materialRoutes from './routes/materialRoutes.js';
import adminMaterialRoutes from './routes/adminMaterialRoutes.js';
import adminSubjectRoutes from './routes/adminSubjectRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// --- Mount all your routes ---
app.use('/api/departments', departmentRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/comments', commentRoutes);

// Admin Routes (for you to approve/reject submissions)
app.use('/api/admin/materials', adminMaterialRoutes);
app.use('/api/admin/subjects', adminSubjectRoutes);


// Basic route for home
app.get('/', (req, res) => {
  res.send('Welcome to the Notes de KIET Backend API!');
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});