const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const User = require('./models/User');
const Dataset = require('./models/Dataset');
const Model = require('./models/Model');
const Experiment = require('./models/Experiment');

const ATLAS_URI = 'mongodb+srv://kanchigurugoutham_db_user:1IjNQ5YTtyvvHSdB@modellab.5y8igxh.mongodb.net/modellab?retryWrites=true&w=majority&appName=modellab';
const BACKUP_DIR = path.join(__dirname, 'db_migration_backup');

async function importData() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(ATLAS_URI);
    console.log('Connected to Atlas successfully');

    const collections = [
      { name: 'users', model: User, file: 'users.json' },
      { name: 'datasets', model: Dataset, file: 'datasets.json' },
      { name: 'models', model: Model, file: 'models.json' },
      { name: 'experiments', model: Experiment, file: 'experiments.json' }
    ];

    for (const col of collections) {
      const filePath = path.join(BACKUP_DIR, col.file);
      if (!fs.existsSync(filePath)) {
        console.warn(`File ${col.file} not found, skipping...`);
        continue;
      }

      console.log(`Importing ${col.name}...`);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (data.length > 0) {
        // Clear existing data in Atlas for these collections if any (optional but safer for clean migration)
        await col.model.deleteMany({});
        await col.model.insertMany(data);
        console.log(`Imported ${data.length} documents into ${col.name}`);
      } else {
        console.log(`${col.name} backup is empty, skipping import.`);
      }
    }

    console.log('\nMigration to Atlas complete!');
    process.exit(0);
  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  }
}

importData();
