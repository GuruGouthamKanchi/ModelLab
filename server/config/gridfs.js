const mongoose = require('mongoose');

let gfs;

const initGridFS = (db) => {
  gfs = new mongoose.mongo.GridFSBucket(db.db, {
    bucketName: 'uploads'
  });
  console.log('GridFS initialized');
};

const getGFS = () => {
  if (!gfs) {
    throw new Error('GridFS not initialized. Call initGridFS first.');
  }
  return gfs;
};

module.exports = { initGridFS, getGFS };
