const mongoose = require('mongoose');
const config = require('./config/env');
const User = require('./models/User');

const run = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    const users = await User.find();
    console.log('--- ALL USERS IN DB ---');
    users.forEach(u => {
      console.log(`Email: ${u.email}, Role: ${u.role}, Name: ${u.name}`);
    });
    console.log('-----------------------');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
