const express = require('express');
const { getExperiments } = require('../controllers/experiment');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/history', auth, getExperiments);

module.exports = router;
