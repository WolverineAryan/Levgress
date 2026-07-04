const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);

    // Auto-seed if database is empty
    const MasterSkill = require('../models/MasterSkill');
    const count = await MasterSkill.countDocuments();
    if (count === 0) {
      console.log('MasterSkills collection is empty. Running auto-seeding...');
      const Badge = require('../models/Badge');
      const { BADGES, MASTER_SKILLS } = require('../seed/seedAll');

      // Clear and insert
      await Badge.deleteMany();
      await MasterSkill.deleteMany();

      await Badge.insertMany(BADGES);
      await MasterSkill.insertMany(MASTER_SKILLS);
      console.log('Database auto-seeded successfully!');
    }
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
