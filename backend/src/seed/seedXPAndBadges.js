const mongoose = require('mongoose');
const User = require('../models/User');
const StudentStats = require('../models/StudentStats');
const Badge = require('../models/Badge');
const StudentBadge = require('../models/StudentBadge');
const config = require('../config/env');

const MAX_LEVEL = 100;
const xpForLevelUp = (currentLevel) => {
  if (currentLevel >= MAX_LEVEL) return Infinity;
  return 250 + (currentLevel - 1) * 150;
};

const runXPSeeder = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(config.mongoUri);
    console.log('Database connected.');

    // Fetch all student users
    const students = await User.find({ role: 'STUDENT' });
    console.log(`Found ${students.length} students in the database.`);

    // Fetch all badges
    const badges = await Badge.find();
    console.log(`Found ${badges.length} badges in the database.`);

    if (badges.length === 0) {
      console.log('WARNING: No badges found in database. Make sure the database is seeded with badges first!');
    }

    for (const student of students) {
      // Find or create StudentStats
      let stats = await StudentStats.findOne({ user: student._id });
      if (!stats) {
        stats = await StudentStats.create({
          user: student._id,
          xp: 0,
          level: 1,
          streak: 0,
          skills: [],
        });
      } else if (stats.xp > 0) {
        console.log(`Skipping active student user (has original XP): ${student.name} (${stats.xp} XP)`);
        continue;
      }

      // 1. Randomize level (between 1 and 6)
      const randomLevel = Math.floor(Math.random() * 6) + 1;
      
      // 2. Randomize XP within that level's limit
      const maxXP = xpForLevelUp(randomLevel);
      const randomXP = Math.floor(Math.random() * (maxXP - 50)) + 10; // keep it within limit but not 0

      // 3. Randomize streak (between 0 and 8)
      const randomStreak = Math.floor(Math.random() * 9);

      // Update stats
      stats.level = randomLevel;
      stats.xp = randomXP;
      stats.streak = randomStreak;
      stats.lastActive = new Date();
      await stats.save();

      console.log(`Updated stats for ${student.name}: Level ${randomLevel}, XP ${randomXP}/${maxXP}, Streak ${randomStreak}`);

      // 4. Award 1 to 3 random badges (if badges exist)
      if (badges.length > 0) {
        // Clear old student badges to start fresh
        await StudentBadge.deleteMany({ student: student._id });

        // Shuffle badges and pick a random count of badges (between 1 and 3)
        const shuffledBadges = [...badges].sort(() => 0.5 - Math.random());
        const badgeCountToAward = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3 badges
        const selectedBadges = shuffledBadges.slice(0, badgeCountToAward);

        const studentBadgesToInsert = selectedBadges.map((b) => ({
          student: student._id,
          badge: b._id,
          earnedAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000), // earned in the last 10 days
        }));

        await StudentBadge.insertMany(studentBadgesToInsert);
        console.log(`  Awarded ${badgeCountToAward} badge(s) to ${student.name}`);
      }
    }

    console.log('Leaderboard XP and Badges randomized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running XP seeder:', error);
    process.exit(1);
  }
};

runXPSeeder();
