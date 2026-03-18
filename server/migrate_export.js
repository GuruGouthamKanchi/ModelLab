const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env for local connection
dotenv.config();

const User = require('./models/User');
const Dataset = require('./models/Dataset');
const Model = require('./models/Model');
const Experiment = require('./models/Experiment');

const BACKUP_DIR = path.join(__dirname, 'db_migration_backup');

async function exportData() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR);
    }

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/modellab');
    console.log('Connected to local MongoDB');

    const collections = [
      { name: 'users', model: User },
      { name: 'datasets', model: Dataset },
      { name: 'models', model: Model },
      { name: 'experiments', model: Experiment }
    ];

    for (const col of collections) {
      console.log(`Exporting ${col.name}...`);
      const data = await col.model.find({});
      fs.writeFileSync(
        path.join(BACKUP_DIR, `${col.name}.json`),
        JSON.stringify(data, null, 2)
      );
      console.log(`Exported ${data.length} documents from ${col.name}`);
    }

    console.log(`\nBackup complete. Files saved in: ${BACKUP_DIR}`);
    process.exit(0);
  } catch (err) {
    console.error('Export failed:', err);
    process.exit(1);
  }
}

exportData();
