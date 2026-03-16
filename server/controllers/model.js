const Model = require('../models/Model');
const Dataset = require('../models/Dataset');
const Experiment = require('../models/Experiment');
const axios = require('axios');
const path = require('path');

const trainModel = async (req, res) => {
  try {
    const { datasetId, name, algorithm, targetColumn, features, parameters } = req.body;
    
    const dataset = await Dataset.findById(datasetId);
    if (!dataset) return res.status(404).json({ message: 'Dataset not found' });

    const model = new Model({
      userId: req.user,
      datasetId,
      name,
      algorithm,
      targetColumn,
      features,
      parameters,
      status: 'training'
    });

    await model.save();

    // Trigger Python ML Engine in the background
    // Respond to client immediately with 202 Accepted
    res.status(202).json(model);

    // Background process
    (async () => {
      try {
        const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/train`, {
          dataset_path: path.resolve(dataset.filePath),
          algorithm,
          target_column: targetColumn,
          features,
          parameters
        }, { timeout: 300000 }); // 5 minute timeout for background process

        const { metrics, model_path } = mlResponse.data;
        
        model.status = 'completed';
        model.metrics = metrics;
        model.modelPath = model_path;
        await model.save();

        // Create experiment entry
        const experiment = new Experiment({
          userId: req.user,
          datasetId,
          modelId: model._id,
          algorithm,
          metrics,
          parameters
        });
        await experiment.save();
        console.log(`Model ${model._id} training completed`);
      } catch (mlError) {
        console.error('ML Service Error:', mlError.response?.data || mlError.message);
        model.status = 'failed';
        model.error = mlError.response?.data?.detail || mlError.message;
        await model.save();
      }
    })();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getModels = async (req, res) => {
  try {
    const models = await Model.find({ userId: req.user }).sort({ createdAt: -1 });
    res.json(models);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getModelById = async (req, res) => {
  try {
    const model = await Model.findOne({ _id: req.params.id, userId: req.user });
    if (!model) return res.status(404).json({ message: 'Model not found' });
    res.json(model);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const predict = async (req, res) => {
  try {
    const { modelId, inputs } = req.body;
    const model = await Model.findById(modelId);
    if (!model) return res.status(404).json({ message: 'Model not found' });

    const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
      model_path: model.modelPath,
      inputs
    });

    res.json(mlResponse.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { trainModel, getModels, getModelById, predict };
