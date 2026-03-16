const express = require('express');
const multer = require('multer');
const { uploadDataset, getDatasets, getDatasetById, deleteDataset, cleanDataset } = require('../controllers/dataset');
const auth = require('../middleware/auth');
const router = express.Router();
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/upload', auth, upload.single('file'), uploadDataset);
router.get('/list', auth, getDatasets);
router.get('/:id', auth, getDatasetById);
router.delete('/:id', auth, deleteDataset);
router.post('/:id/clean', auth, cleanDataset);

module.exports = router;
