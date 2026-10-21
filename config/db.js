require('dotenv').config();

const mongoose = require('mongoose');

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://Rankraze:XBjy4jmAp82XHTxV@cluster0.lpeh1im.mongodb.net/praja-group?retryWrites=true&w=majority';

async function dbConnect() {
  try {
    if (!MONGO_URI) {
      console.error('MONGO_URI Is Missing');
      return;
    }
    await mongoose.connect(MONGO_URI);
    console.log('Database Connected Successfully');

    // Run Super Admin Seed
    try {
      const seedSuperAdmin = require('../utils/seedAdmin');
      await seedSuperAdmin();
    } catch (seedErr) {
      console.error('Seed execution note:', seedErr.message);
    }
  } catch (err) {
    console.error('Database Connection Failed:', err.message);
  }
}

module.exports = dbConnect;