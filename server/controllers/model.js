const Model = require('../models/Model');
const Dataset = require('../models/Dataset');
const Experiment = require('../models/Experiment');
const { getGFS } = require('../config/gridfs');
const { Readable } = require('stream');
const axios = require('axios');
const FormData = require('form-data');
const mongoose = require('mongoose');

const ML_ENGINE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const trainModel = async (req, res) => {
  try {
    const { datasetId, name, algorithm, targetColumn, features, parameters } = req.body;
    
    const dataset = await Dataset.findById(datasetId);
    if (!dataset) return res.status(404).json({ message: 'Dataset not found' });

    const modelRecord = new Model({
      userId: req.user,
      datasetId,
      name,
      algorithm,
      targetColumn,
      features,
      parameters,
      status: 'training'
    });

    await modelRecord.save();
    res.status(202).json(modelRecord);

    // Background Training
    const startTime = Date.now();
    (async () => {
      try {
        const gfs = getGFS();
        const downloadStream = gfs.openDownloadStream(dataset.fileId);
        
        const chunks = [];
        await new Promise((resolve) => {
          downloadStream.on('data', c => chunks.push(c));
          downloadStream.on('end', resolve);
        });
        const datasetBuffer = Buffer.concat(chunks);

        const formData = new FormData();
        formData.append('file', datasetBuffer, dataset.originalName);
        formData.append('algorithm', algorithm);
        formData.append('target_column', targetColumn);
        formData.append('features', Array.isArray(features) ? features.join(',') : features);
        formData.append('parameters', JSON.stringify(parameters || {}));

        const mlResponse = await axios.post(`${ML_ENGINE_URL}/train`, formData, {
          headers: formData.getHeaders(),
          timeout: 600000 // 10 minutes
        });

        const { metrics, task_type, feature_importances, actual_vs_predicted, class_labels, model_binary } = mlResponse.data;
        const trainingDuration = (Date.now() - startTime) / 1000;

        // Save model to GridFS
        const modelBuffer = Buffer.from(model_binary, 'hex');
        const uploadStream = gfs.openUploadStream(`${modelRecord._id}.joblib`);
        const fileId = uploadStream.id;
        
        const s = new Readable();
        s.push(modelBuffer);
        s.push(null);
        await new Promise((r) => s.pipe(uploadStream).on('finish', r));

        modelRecord.status = 'completed';
        modelRecord.metrics = metrics;
        modelRecord.fileId = fileId;
        modelRecord.taskType = task_type;
        modelRecord.featureImportances = feature_importances;
        modelRecord.actualVsPredicted = actual_vs_predicted;
        modelRecord.classLabels = class_labels;
        modelRecord.trainingDuration = trainingDuration;
        await modelRecord.save();

        const experiment = new Experiment({
          userId: req.user,
          datasetId,
          modelId: modelRecord._id,
          algorithm,
          metrics,
          parameters
        });
        await experiment.save();

      } catch (err) {
        console.error("Training background error:", err.message);
        modelRecord.status = 'failed';
        modelRecord.error = err.message;
        await modelRecord.save();
      }
    })();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getModels = async (req, res) => {
  try {
    const models = await Model.find({ userId: req.user })
      .populate('datasetId', 'name rowCount columnCount')
      .sort({ createdAt: -1 });
    res.json(models);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getModelById = async (req, res) => {
  try {
    const model = await Model.findOne({ _id: req.params.id, userId: req.user })
      .populate('datasetId', 'name rowCount columnCount');
    if (!model) return res.status(404).json({ message: 'Model not found' });
    res.json(model);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteModel = async (req, res) => {
  try {
    const model = await Model.findOne({ _id: req.params.id, userId: req.user });
    if (!model) return res.status(404).json({ message: 'Model not found' });

    const gfs = getGFS();
    if (model.fileId) {
      await gfs.delete(model.fileId);
    }

    await Experiment.deleteMany({ modelId: model._id });
    await Model.findByIdAndDelete(model._id);

    res.json({ message: 'Model deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const predict = async (req, res) => {
  try {
    const { modelId, inputs } = req.body;
    const model = await Model.findOne({ _id: modelId, userId: req.user });
    if (!model) return res.status(404).json({ message: 'Model not found' });

    const gfs = getGFS();
    const downloadStream = gfs.openDownloadStream(model.fileId);
    
    const chunks = [];
    await new Promise((resolve) => {
      downloadStream.on('data', c => chunks.push(c));
      downloadStream.on('end', resolve);
    });
    const modelBuffer = Buffer.concat(chunks);

    const formData = new FormData();
    formData.append('model_file', modelBuffer, `${modelId}.joblib`);
    formData.append('inputs', JSON.stringify(inputs));

    const mlResponse = await axios.post(`${ML_ENGINE_URL}/predict`, formData, {
      headers: formData.getHeaders()
    });

    res.json(mlResponse.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { trainModel, getModels, getModelById, deleteModel, predict };
