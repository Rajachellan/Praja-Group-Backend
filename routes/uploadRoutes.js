const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { processFileUpload } = require('../services/uploadService');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, 'file-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'
  ];
  if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image (JPG, PNG, WEBP) and document (PDF, DOC, DOCX) files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter
});

// Image Upload Endpoint (uploads to R2 folder "images")
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach an image file' });
    }
    const result = await processFileUpload(req.file, req, 'images');
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Image upload failed' });
  }
});

// PDF / Document Upload Endpoint for Associate Directors form (uploads to Cloudflare R2 folder "associate-directors")
router.post('/document', upload.single('file'), async (req, res) => {
  try {
    const file = req.file || (req.files && req.files[0]);
    if (!file) {
      return res.status(400).json({ success: false, message: 'Please attach a document file (PDF/DOC)' });
    }
    const result = await processFileUpload(file, req, 'associate-directors');
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Document upload failed' });
  }
});

// Generic file upload endpoint
router.post('/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a file' });
    }
    const result = await processFileUpload(req.file, req, 'documents');
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'File upload failed' });
  }
});

module.exports = router;

