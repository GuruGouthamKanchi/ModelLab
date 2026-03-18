const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Dataset = require('./models/Dataset');
const Model = require('./models/Model');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/modellab')
  .then(async () => {
    const userId = '69ba1ea72d962282ea7111ae'; // From logs
    const datasets = await Dataset.find({ userId });
    const models = await Model.find({ userId });
    
    console.log(`User: ${userId}`);
    console.log(`Datasets Found: ${datasets.length}`);
    datasets.forEach(d => console.log(` - Dataset: ${d.name} (${d._id})`));
    console.log(`Models Found: ${models.length}`);
    models.forEach(m => console.log(` - Model: ${m.name} (${m._id})`));
    
    process.exit(0);
  });
