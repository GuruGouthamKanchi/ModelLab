const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Dataset = require('./models/Dataset');
const Model = require('./models/Model');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/modellab')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const userCount = await User.countDocuments();
    const datasetCount = await Dataset.countDocuments();
    const modelCount = await Model.countDocuments();
    
    console.log(`Users: ${userCount}`);
    console.log(`Datasets: ${datasetCount}`);
    console.log(`Models: ${modelCount}`);
    
    if (datasetCount > 0) {
      const firstDataset = await Dataset.findOne();
      console.log('Sample Dataset:', {
        id: firstDataset._id,
        name: firstDataset.name,
        userId: firstDataset.userId
      });
    }

    if (modelCount > 0) {
      const firstModel = await Model.findOne();
      console.log('Sample Model:', {
        id: firstModel._id,
        name: firstModel.name,
        userId: firstModel.userId
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
