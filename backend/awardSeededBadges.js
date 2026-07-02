const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/levgress';

const User = require('./src/models/User');
const StudentStats = require('./src/models/StudentStats');
const StudentBadge = require('./src/models/StudentBadge');
const Badge = require('./src/models/Badge');
const Project = require('./src/models/Project');
const { checkAndAwardBadges, getCumulativeXP } = require('./src/services/gamification.service');

const run = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to DB.');

    // Find all students
    const students = await User.find({ role: 'STUDENT' });
    console.log(`Evaluating badges for ${students.length} students...`);

    for (const student of students) {
      const stats = await StudentStats.findOne({ user: student._id });
      if (!stats) continue;

      console.log(`Evaluating student: ${student.name}`);

      // 1. Level up check
      await checkAndAwardBadges(student._id, 'LEVEL_UP', stats.level);

      // 2. XP total check
      const totalLifetimeXP = getCumulativeXP(stats.level, stats.xp);
      await checkAndAwardBadges(student._id, 'XP_TOTAL', totalLifetimeXP);

      // 3. Streak check
      await checkAndAwardBadges(student._id, 'STREAK', stats.streak);

      // 4. Skills count check
      await checkAndAwardBadges(student._id, 'SKILL_COUNT', stats.skills.length);

      // 5. Frontend & Backend skills check
      const frontendCount = stats.skills.filter(
        (s) => s.category.toLowerCase() === 'frontend' && s.tier !== 'UNVERIFIED'
      ).length;
      const backendCount = stats.skills.filter(
        (s) => s.category.toLowerCase() === 'backend' && s.tier !== 'UNVERIFIED'
      ).length;
      await checkAndAwardBadges(student._id, 'FRONTEND_SKILLS', frontendCount);
      await checkAndAwardBadges(student._id, 'BACKEND_SKILLS', backendCount);

      // 6. Project count check
      const completedProjects = await Project.countDocuments({ student: student._id, status: 'COMPLETED' });
      await checkAndAwardBadges(student._id, 'PROJECT_COUNT', completedProjects);
    }

    console.log('Finished evaluation.');
    process.exit(0);
  } catch (err) {
    console.error('Error running evaluation:', err);
    process.exit(1);
  }
};

run();
