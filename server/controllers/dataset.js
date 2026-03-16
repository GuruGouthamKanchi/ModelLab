const Dataset = require('../models/Dataset');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const axios = require('axios');

const ML_ENGINE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const uploadDataset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { name, description } = req.body;
    const filePath = req.file.path;
    const fileType = path.extname(req.file.originalname).toLowerCase();
    
    // Validate File Type
    if (!['.csv', '.xlsx', '.xls', '.json'].includes(fileType)) {
      fs.unlinkSync(filePath); // Cleanup
      return res.status(400).json({ message: 'Unsupported file format. Please upload CSV, XLSX, or JSON.' });
    }

    // Call ML Engine to Analyze the Dataset
    try {
      const analyzeRes = await axios.post(`${ML_ENGINE_URL}/analyze`, {
        dataset_path: path.resolve(filePath)
      });
      
      const stats = analyzeRes.data;

      // Extract columns and metadata from the Python analysis result
      const columns = Object.keys(stats.dtypes).map(colName => ({
        name: colName,
        type: stats.dtypes[colName].includes('int') || stats.dtypes[colName].includes('float') ? 'number' : 'string',
        missingCount: stats.missing_values[colName] || 0,
        uniqueCount: stats.categorical_stats[colName]?.unique_count || 0,
        sampleValues: [] // We'll skip raw sample loading here to save DB space, previews handle it.
      }));

      const dataset = new Dataset({
        userId: req.user,
        name: name || req.file.originalname,
        description: description || '',
        originalName: req.file.originalname,
        filePath: filePath,
        fileType: fileType,
        columns: columns,
        rowCount: stats.total_rows,
        columnCount: stats.total_columns,
        metadata: {
          fileSize: req.file.size,
          numeric_stats: stats.numeric_stats,
          histograms: stats.histograms,
          correlation: stats.correlation,
          categorical_stats: stats.categorical_stats
        }
      });

      await dataset.save();
      res.status(201).json(dataset);

    } catch (mlError) {
      console.error("ML Engine Analysis Failed Detailed:");
      if (mlError.response) {
        console.error(" - Status:", mlError.response.status);
        console.error(" - Data:", mlError.response.data);
      } else {
        console.error(" - Message:", mlError.message);
      }
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Cleanup
      return res.status(500).json({ message: 'Failed to analyze dataset via ML Engine', details: mlError.message });
    }
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: error.message });
  }
};

const getDatasets = async (req, res) => {
  try {
    const datasets = await Dataset.find({ userId: req.user }).select('-metadata').sort({ uploadedAt: -1 });
    res.json(datasets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDatasetById = async (req, res) => {
  try {
    const dataset = await Dataset.findOne({ _id: req.params.id, userId: req.user });
    if (!dataset) return res.status(404).json({ message: 'Dataset not found' });
    
    // Also re-verify and fetch the first 50 rows for preview
    let previewData = [];
    try {
      if (dataset.fileType === '.csv') {
        const results = [];
        let count = 0;
        await new Promise((resolve, reject) => {
          fs.createReadStream(dataset.filePath)
            .pipe(csv())
            .on('data', (data) => {
              if (count < 50) results.push(data);
              count++;
            })
            .on('end', () => resolve())
            .on('error', reject);
        });
        previewData = results;
      } else if (dataset.fileType === '.xlsx' || dataset.fileType === '.xls') {
        const workbook = xlsx.readFile(dataset.filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        previewData = xlsx.utils.sheet_to_json(worksheet).slice(0, 50);
      } else if (dataset.fileType === '.json') {
        const rawJson = fs.readFileSync(dataset.filePath, 'utf8');
        const parsed = JSON.parse(rawJson);
        previewData = Array.isArray(parsed) ? parsed.slice(0, 50) : [];
      }
    } catch(e) {
      console.error("Preview extraction failed:", e);
    }

    res.json({ dataset, preview: previewData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findOne({ _id: req.params.id, userId: req.user });
    if (!dataset) return res.status(404).json({ message: 'Dataset not found' });

    // Delete local file
    if (fs.existsSync(dataset.filePath)) {
      fs.unlinkSync(dataset.filePath);
    }

    await Dataset.findByIdAndDelete(req.params.id);
    res.json({ message: 'Dataset deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cleanDataset = async (req, res) => {
  try {
    const { drop_missing, fill_missing, drop_columns, encode_categorical } = req.body;
    
    // Find the original dataset
    const originalDataset = await Dataset.findOne({ _id: req.params.id, userId: req.user });
    if (!originalDataset) return res.status(404).json({ message: 'Dataset not found' });

    // Call ML Engine to clean
    const cleanRes = await axios.post(`${ML_ENGINE_URL}/clean`, {
      dataset_path: path.resolve(originalDataset.filePath),
      drop_missing: drop_missing || False,
      fill_missing: fill_missing || None,
      drop_columns: drop_columns || [],
      encode_categorical: encode_categorical || False
    });

    const newFilePath = cleanRes.data.cleaned_dataset_path;
    
    // Once cleaned, call /analyze on the new file to get its metadata
    const analyzeRes = await axios.post(`${ML_ENGINE_URL}/analyze`, {
      dataset_path: newFilePath
    });
    
    const stats = analyzeRes.data;

    // Build columns for the cleaned dataset
    const columns = Object.keys(stats.dtypes).map(colName => ({
      name: colName,
      type: stats.dtypes[colName].includes('int') || stats.dtypes[colName].includes('float') ? 'number' : 'string',
      missingCount: stats.missing_values[colName] || 0,
      uniqueCount: stats.categorical_stats[colName]?.unique_count || 0,
      sampleValues: [] 
    }));

    // Create a new record in the DB for the cleaned dataset
    const newDatasetName = `Cleaned_${originalDataset.name}`;
    const cleanedDataset = new Dataset({
      userId: req.user,
      name: newDatasetName,
      description: `Cleaned version of ${originalDataset.name}`,
      originalName: path.basename(newFilePath),
      filePath: newFilePath,
      fileType: '.csv', // Pandas exports as CSV
      columns: columns,
      rowCount: stats.total_rows,
      columnCount: stats.total_columns,
      metadata: {
        fileSize: fs.statSync(newFilePath).size,
        numeric_stats: stats.numeric_stats,
        histograms: stats.histograms,
        correlation: stats.correlation,
        categorical_stats: stats.categorical_stats
      },
      isCleanedVersion: true,
      parentDatasetId: originalDataset._id
    });

    await cleanedDataset.save();
    
    res.status(201).json({
      message: 'Dataset cleaned & analyzed successfully',
      dataset: cleanedDataset
    });

  } catch (error) {
    console.error("Clean operation failed:", error.message);
    res.status(500).json({ message: error.response?.data?.detail || error.message || 'Cleaning failed' });
  }
};

module.exports = { uploadDataset, getDatasets, getDatasetById, deleteDataset, cleanDataset };
