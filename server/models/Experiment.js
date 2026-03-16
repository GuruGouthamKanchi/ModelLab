const mongoose = require('mongoose');

const experimentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  datasetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset', required: true },
  modelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Model' },
  algorithm: { type: String, required: true },
  metrics: mongoose.Schema.Types.Mixed,
  parameters: mongoose.Schema.Types.Mixed,
  logs: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Experiment', experimentSchema);
