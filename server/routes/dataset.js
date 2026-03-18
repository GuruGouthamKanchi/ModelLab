const express = require('express');
const multer = require('multer');
const { uploadDataset, getDatasets, getDatasetById, previewDataset, deleteDataset, cleanDataset } = require('../controllers/dataset');
const auth = require('../middleware/auth');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const storage = multer.memoryStorage();

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.csv', '.xlsx', '.xls', '.json'].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Please upload CSV, XLSX, or JSON.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: fileFilter
});

router.post('/upload', auth, upload.single('file'), uploadDataset);
router.get('/list', auth, getDatasets);
router.get('/:id', auth, getDatasetById);
router.get('/:id/preview', auth, previewDataset);
router.delete('/:id', auth, deleteDataset);
router.post('/:id/clean', auth, cleanDataset);

module.exports = router;
