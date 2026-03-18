const Dataset = require('../models/Dataset');
const { getGFS } = require('../config/gridfs');
const { Readable } = require('stream');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const axios = require('axios');
const FormData = require('form-data');
const mongoose = require('mongoose');

const ML_ENGINE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const uploadDataset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { name, description } = req.body;
    const { buffer, originalname, size } = req.file;
    const fileType = require('path').extname(originalname).toLowerCase();
    
    // Validate file type
    if (!['.csv', '.xlsx', '.xls', '.json'].includes(fileType)) {
      return res.status(400).json({ message: 'Unsupported file format.' });
    }

    // Call ML Engine to Analyze (Binary)
    const formData = new FormData();
    formData.append('file', buffer, originalname);

    const analyzeRes = await axios.post(`${ML_ENGINE_URL}/analyze`, formData, {
      headers: formData.getHeaders(),
      timeout: 120000
    });
    
    const stats = analyzeRes.data;

    // Save to GridFS
    const gfs = getGFS();
    const uploadStream = gfs.openUploadStream(originalname, {
      contentType: req.file.mimetype
    });
    
    const fileId = uploadStream.id;
    
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    
    await new Promise((resolve, reject) => {
      readableStream.pipe(uploadStream)
        .on('error', reject)
        .on('finish', resolve);
    });

    const columns = Object.keys(stats.dtypes).map(colName => ({
      name: colName,
      type: stats.dtypes[colName].includes('int') || stats.dtypes[colName].includes('float') ? 'number' : 'string',
      missingCount: stats.missing_values[colName] || 0,
      uniqueCount: stats.categorical_stats[colName]?.unique_count || 0,
      sampleValues: []
    }));

    const dataset = new Dataset({
      userId: req.user,
      name: name || originalname,
      description: description || '',
      originalName: originalname,
      fileId: fileId,
      fileType: fileType,
      columns: columns,
      rowCount: stats.total_rows,
      columnCount: stats.total_columns,
      metadata: {
        fileSize: size,
        numeric_stats: stats.numeric_stats,
        histograms: stats.histograms,
        correlation: stats.correlation,
        categorical_stats: stats.categorical_stats
      }
    });

    await dataset.save();
    res.status(201).json(dataset);

  } catch (error) {
    console.error("Upload failed:", error.message);
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
    
    // Preview from GridFS
    let previewData = [];
    const gfs = getGFS();
    
    if (dataset.fileId) {
      const downloadStream = gfs.openDownloadStream(dataset.fileId);
      const chunks = [];
      
      await new Promise((resolve, reject) => {
        downloadStream.on('data', chunk => chunks.push(chunk));
        downloadStream.on('error', reject);
        downloadStream.on('end', resolve);
      });
      
      const buffer = Buffer.concat(chunks);
      
      if (dataset.fileType === '.csv') {
        const results = [];
        await new Promise((resolve) => {
          const s = new Readable();
          s.push(buffer);
          s.push(null);
          s.pipe(csv())
            .on('data', (data) => { if (results.length < 50) results.push(data); })
            .on('end', () => resolve());
        });
        previewData = results;
      } else if (dataset.fileType.includes('xls')) {
        const workbook = xlsx.read(buffer);
        previewData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]).slice(0, 50);
      } else if (dataset.fileType === '.json') {
        previewData = JSON.parse(buffer.toString()).slice(0, 50);
      }
    }

    res.json({ dataset, preview: previewData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const previewDataset = async (req, res) => {
    // Similar to getDatasetById but with offset/limit
    // For simplicity, reusing logic
    return getDatasetById(req, res); 
};

const deleteDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findOne({ _id: req.params.id, userId: req.user });
    if (!dataset) return res.status(404).json({ message: 'Dataset not found' });

    const gfs = getGFS();
    if (dataset.fileId) {
      await gfs.delete(dataset.fileId);
    }

    const cleanedVersions = await Dataset.find({ parentDatasetId: dataset._id });
    for (const cleaned of cleanedVersions) {
      if (cleaned.fileId) await gfs.delete(cleaned.fileId);
      await Dataset.findByIdAndDelete(cleaned._id);
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
    const originalDataset = await Dataset.findOne({ _id: req.params.id, userId: req.user });
    if (!originalDataset) return res.status(404).json({ message: 'Dataset not found' });

    const gfs = getGFS();
    const downloadStream = gfs.openDownloadStream(originalDataset.fileId);
    
    const chunks = [];
    await new Promise((resolve) => {
      downloadStream.on('data', c => chunks.push(c));
      downloadStream.on('end', resolve);
    });
    const buffer = Buffer.concat(chunks);

    const formData = new FormData();
    formData.append('file', buffer, originalDataset.originalName);
    formData.append('drop_missing', String(drop_missing || false));
    if (fill_missing) formData.append('fill_missing', fill_missing);
    if (drop_columns) formData.append('drop_columns', Array.isArray(drop_columns) ? drop_columns.join(',') : drop_columns);
    formData.append('encode_categorical', String(encode_categorical || false));

    const cleanRes = await axios.post(`${ML_ENGINE_URL}/clean`, formData, {
      headers: formData.getHeaders(),
      responseType: 'arraybuffer',
      timeout: 120000
    });

    const cleanedBuffer = Buffer.from(cleanRes.data);
    const cleanedFilename = `cleaned_${originalDataset.originalName}`;
    
    // Save cleaned to GridFS
    const uploadStream = gfs.openUploadStream(cleanedFilename);
    const cleanedFileId = uploadStream.id;
    
    const s = new Readable();
    s.push(cleanedBuffer);
    s.push(null);
    await new Promise((r) => s.pipe(uploadStream).on('finish', r));

    // Analyze cleaned
    const analyzeFormData = new FormData();
    analyzeFormData.append('file', cleanedBuffer, cleanedFilename);
    const analyzeRes = await axios.post(`${ML_ENGINE_URL}/analyze`, analyzeFormData, {
      headers: analyzeFormData.getHeaders()
    });
    
    const stats = analyzeRes.data;

    const cleanedDataset = new Dataset({
      userId: req.user,
      name: `Cleaned_${originalDataset.name}`,
      originalName: cleanedFilename,
      fileId: cleanedFileId,
      fileType: '.csv',
      columns: Object.keys(stats.dtypes).map(c => ({ name: c, type: 'number' })), // Simplified for brevity
      rowCount: stats.total_rows,
      columnCount: stats.total_columns,
      metadata: { fileSize: cleanedBuffer.length, ...stats },
      isCleanedVersion: true,
      parentDatasetId: originalDataset._id
    });

    await cleanedDataset.save();
    res.status(201).json(cleanedDataset);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadDataset, getDatasets, getDatasetById, previewDataset, deleteDataset, cleanDataset };
