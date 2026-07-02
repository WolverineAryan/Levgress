const mongoose = require('mongoose');
const config = require('../config/env');
const User = require('../models/User');

const seedInstructor = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to DB.');

    // Check if instructor@levgress.com exists
    let instructor = await User.findOne({ email: 'instructor@levgress.com' });
    if (!instructor) {
      instructor = await User.create({
        name: 'Mock Instructor',
        email: 'instructor@levgress.com',
        role: 'STAFF',
        onboarded: true,
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Instructor',
      });
      console.log('Created mock instructor:', instructor);
    } else {
      instructor.role = 'STAFF';
      await instructor.save();
      console.log('Updated existing instructor:', instructor);
    }

    // Ensure 36thoraryan@gmail.com is also STAFF
    let aryan = await User.findOne({ email: '36thoraryan@gmail.com' });
    if (aryan) {
      aryan.role = 'STAFF';
      await aryan.save();
      console.log('Ensured 36thoraryan@gmail.com is STAFF.');
    } else {
      await User.create({
        name: 'Aryan Thormise',
        email: '36thoraryan@gmail.com',
        role: 'STAFF',
        onboarded: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan',
      });
      console.log('Created 36thoraryan@gmail.com as STAFF.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedInstructor();
