const Experiment = require('../models/Experiment');

const getExperiments = async (req, res) => {
  try {
    const experiments = await Experiment.find({ userId: req.user })
      .populate('datasetId', 'name')
      .sort({ createdAt: -1 });
    res.json(experiments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getExperiments };
