const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const controller = require('../controllers/applicationController');
const { allowedFileTypes, allowedFileExtensions } = require('../services/applicationService');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'uploads', 'applications');

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '-');
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeOriginalName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (allowedFileTypes.has(file.mimetype) || allowedFileExtensions.has(ext)) return cb(null, true);
    return cb(new Error('Invalid file type. Accepted formats: PDF, DOC, DOCX, PPT, PPTX, PNG, JPG.'));
  }
});

const applicationUpload = upload.fields([
  { name: 'submissionFile', maxCount: 1 },
  { name: 'idProofFile', maxCount: 1 }
]);

router.post('/', (req, res, next) => {
  applicationUpload(req, res, (err) => {
    if (err) {
      console.error('Application upload error:', err.message);
      return res.status(400).json({ ok: false, message: err.message });
    }
    return controller.submit(req, res, next);
  });
});

router.get('/', controller.getAll);

module.exports = router;
