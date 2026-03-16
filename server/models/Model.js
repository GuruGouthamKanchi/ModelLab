const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  datasetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset', required: true },
  name: { type: String, required: true },
  algorithm: { type: String, required: true },
  targetColumn: { type: String, required: true },
  features: [String],
  parameters: mongoose.Schema.Types.Mixed,
  metrics: mongoose.Schema.Types.Mixed,
  modelPath: { type: String },
  status: { type: String, enum: ['training', 'completed', 'failed'], default: 'training' },
  error: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Model', modelSchema);
