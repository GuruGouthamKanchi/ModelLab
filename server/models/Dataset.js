const mongoose = require('mongoose');

const datasetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  originalName: { type: String },
  fileId: { type: mongoose.Schema.Types.ObjectId }, // GridFS file ID
  filePath: { type: String }, // Keep for legacy or temporary storage
  fileType: { type: String },
  columns: [{ 
    name: String, 
    type: { type: String },
    sampleValues: [mongoose.Schema.Types.Mixed],
    missingCount: { type: Number, default: 0 },
    uniqueCount: { type: Number, default: 0 }
  }],
  rowCount: { type: Number },
  columnCount: { type: Number },
  metadata: mongoose.Schema.Types.Mixed,
  isCleanedVersion: { type: Boolean, default: false },
  parentDatasetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset', default: null },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Dataset', datasetSchema);
