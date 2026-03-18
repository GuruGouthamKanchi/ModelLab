const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { initGridFS } = require('./config/gridfs');

const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const datasetRoutes = require('./routes/dataset');
const modelRoutes = require('./routes/model');
const experimentRoutes = require('./routes/experiment');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
// Local uploads served as fallback (for legacy datasets)
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dataset', datasetRoutes);
app.use('/api/model', modelRoutes);
app.use('/api/experiment', experimentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ModelLab API is running' });
});

// MongoDB Connection
console.log('Initiating MongoDB connection...');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/modellab', {
  serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('Connected to MongoDB Successfully');
    initGridFS(mongoose.connection);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('CRITICAL: MongoDB connection error:', err.message);
    process.exit(1); // Exit on failure so we can see it
  });
