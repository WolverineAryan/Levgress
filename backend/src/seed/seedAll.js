const mongoose = require('mongoose');
const Badge = require('../models/Badge');
const MasterSkill = require('../models/MasterSkill');
const StudentBadge = require('../models/StudentBadge');
const config = require('../config/env');


const BADGES = [
  {
    name: 'First Launch',
    description: 'Complete at least 1 project (reach milestone 5).',
    icon: 'rocket',
    criteriaType: 'PROJECT_COUNT',
    criteriaValue: 1,
    category: 'PROJECTS',
    xpReward: 250,
  },
  {
    name: 'Productivity Machine',
    description: 'Complete 3 projects successfully.',
    icon: 'target',
    criteriaType: 'PROJECT_COUNT',
    criteriaValue: 3,
    category: 'PROJECTS',
    xpReward: 500,
  },
  {
    name: 'On Fire',
    description: 'Maintain a 3-day active streak.',
    icon: 'flame',
    criteriaType: 'STREAK',
    criteriaValue: 3,
    category: 'STREAKS',
    xpReward: 150,
  },
  {
    name: 'Streak Master',
    description: 'Maintain a 7-day active streak.',
    icon: 'zap',
    criteriaType: 'STREAK',
    criteriaValue: 7,
    category: 'STREAKS',
    xpReward: 300,
  },
  {
    name: 'Rising Star',
    description: 'Reach Level 5.',
    icon: 'star',
    criteriaType: 'LEVEL_UP',
    criteriaValue: 5,
    category: 'LEVELS',
    xpReward: 250,
  },
  {
    name: 'Elite Engineer',
    description: 'Reach Level 10.',
    icon: 'award',
    criteriaType: 'LEVEL_UP',
    criteriaValue: 10,
    category: 'LEVELS',
    xpReward: 500,
  },
  {
    name: 'Knowledge Collector',
    description: 'Add 5 skills to your dashboard.',
    icon: 'book',
    criteriaType: 'SKILL_COUNT',
    criteriaValue: 5,
    category: 'SPECIAL',
    xpReward: 200,
  },
  {
    name: 'XP Hunter',
    description: 'Earn 1,000 total lifetime XP.',
    icon: 'shield',
    criteriaType: 'XP_TOTAL',
    criteriaValue: 1000,
    category: 'SPECIAL',
    xpReward: 250,
  },
];

const MASTER_SKILLS = [
  { name: 'React', category: 'Frontend', description: 'Component-based UI library' },
  { name: 'Tailwind CSS', category: 'Frontend', description: 'Utility-first styling' },
  { name: 'HTML & CSS', category: 'Frontend', description: 'Web foundations' },
  { name: 'TypeScript', category: 'Frontend', description: 'Typed JavaScript variant' },
  { name: 'Node.js', category: 'Backend', description: 'JavaScript server runtime' },
  { name: 'Express', category: 'Backend', description: 'Minimalist web framework' },
  { name: 'Python', category: 'Backend', description: 'General-purpose script language' },
  { name: 'Go', category: 'Backend', description: 'Statically typed systems language' },
  { name: 'MongoDB', category: 'Database', description: 'Document-based NoSQL database' },
  { name: 'PostgreSQL', category: 'Database', description: 'Relational database management' },
  { name: 'Redis', category: 'Database', description: 'In-memory caching system' },
  { name: 'Docker', category: 'DevOps', description: 'Containerization tool' },
  { name: 'Git', category: 'DevOps', description: 'Version control system' },
  { name: 'AWS', category: 'DevOps', description: 'Cloud infrastructure platform' },
  { name: 'CI/CD Pipelines', category: 'DevOps', description: 'Continuous integration workflows' },
];

const seedDB = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(config.mongoUri);
    console.log('Database connected.');

    // Clear existing badges, skills and student badges
    console.log('Clearing old collections...');
    await Badge.deleteMany();
    await MasterSkill.deleteMany();
    await StudentBadge.deleteMany();

    // Insert new badges and skills
    console.log('Inserting seed Badges...');
    await Badge.insertMany(BADGES);

    console.log('Inserting seed Master Skills...');
    await MasterSkill.insertMany(MASTER_SKILLS);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed if executed directly
if (require.main === module) {
  seedDB();
}

module.exports = seedDB;
