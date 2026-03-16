const express = require('express');
const { trainModel, getModels, getModelById, predict } = require('../controllers/model');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/train', auth, trainModel);
router.get('/list', auth, getModels);
router.get('/:id', auth, getModelById);
router.post('/predict', auth, predict);

module.exports = router;
