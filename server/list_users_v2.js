const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/modellab')
  .then(async () => {
    const users = await User.find();
    console.log('Users in DB:');
    users.forEach(u => console.log(`- ${u._id} (${u.email}) [${u.name}]`));
    process.exit(0);
  });
