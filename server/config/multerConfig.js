// notes-de-kiet-backend/config/multerConfig.js
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // This path is relative to the backend's root directory (where server.js runs)
    // Make sure you have an 'uploads' directory in your notes-de-kiet-backend folder
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // Creates unique filename: fieldname-timestamp.ext
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // Max file size: 20MB
  fileFilter: (req, file, cb) => {
    // Allowed file types for notes, PYQs, assignments, etc.
    const allowedFiletypes = /pdf|doc|docx|ppt|pptx|zip|txt|jpeg|jpg|png/; // Added common image/text types
    const mimetype = allowedFiletypes.test(file.mimetype);
    const extname = allowedFiletypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: File upload only supports PDF, DOC, DOCX, PPT, PPTX, ZIP, TXT, JPG, JPEG, PNG formats.'));
  },
});

export default upload;