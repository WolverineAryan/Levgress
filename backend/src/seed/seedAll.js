const mongoose = require('mongoose');
const Badge = require('../models/Badge');
const MasterSkill = require('../models/MasterSkill');
const StudentStats = require('../models/StudentStats');
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
  {
    name: 'Backend Guru',
    description: 'Pass 3 backend skills tests.',
    icon: 'server',
    criteriaType: 'BACKEND_SKILLS',
    criteriaValue: 3,
    category: 'SPECIAL',
    xpReward: 250,
  },
  {
    name: 'UI Expert',
    description: 'Pass 3 frontend skills tests.',
    icon: 'layout',
    criteriaType: 'FRONTEND_SKILLS',
    criteriaValue: 3,
    category: 'SPECIAL',
    xpReward: 250,
  },
  {
    name: 'Bug Hunter',
    description: 'Achieve an AI validation score of 95+.',
    icon: 'shield',
    criteriaType: 'BUG_HUNTER',
    criteriaValue: 95,
    category: 'SPECIAL',
    xpReward: 300,
  },

  // --- 55 NEW BADGES ---
  // Level badges
  { name: 'Initiate', description: 'Reach Level 2.', icon: 'star', criteriaType: 'LEVEL_UP', criteriaValue: 2, category: 'LEVELS', xpReward: 100 },
  { name: 'Apprentice', description: 'Reach Level 3.', icon: 'star', criteriaType: 'LEVEL_UP', criteriaValue: 3, category: 'LEVELS', xpReward: 150 },
  { name: 'Novice', description: 'Reach Level 4.', icon: 'star', criteriaType: 'LEVEL_UP', criteriaValue: 4, category: 'LEVELS', xpReward: 200 },
  { name: 'Competent', description: 'Reach Level 6.', icon: 'star', criteriaType: 'LEVEL_UP', criteriaValue: 6, category: 'LEVELS', xpReward: 300 },
  { name: 'Practitioner', description: 'Reach Level 7.', icon: 'star', criteriaType: 'LEVEL_UP', criteriaValue: 7, category: 'LEVELS', xpReward: 350 },
  { name: 'Expert', description: 'Reach Level 8.', icon: 'star', criteriaType: 'LEVEL_UP', criteriaValue: 8, category: 'LEVELS', xpReward: 400 },
  { name: 'Specialist', description: 'Reach Level 9.', icon: 'star', criteriaType: 'LEVEL_UP', criteriaValue: 9, category: 'LEVELS', xpReward: 450 },
  { name: 'Grandmaster', description: 'Reach Level 12.', icon: 'award', criteriaType: 'LEVEL_UP', criteriaValue: 12, category: 'LEVELS', xpReward: 600 },
  { name: 'Legendary Developer', description: 'Reach Level 15.', icon: 'award', criteriaType: 'LEVEL_UP', criteriaValue: 15, category: 'LEVELS', xpReward: 750 },
  { name: 'Elite Hacker', description: 'Reach Level 20.', icon: 'award', criteriaType: 'LEVEL_UP', criteriaValue: 20, category: 'LEVELS', xpReward: 1000 },
  { name: 'Master Architect', description: 'Reach Level 25.', icon: 'award', criteriaType: 'LEVEL_UP', criteriaValue: 25, category: 'LEVELS', xpReward: 1250 },
  { name: 'Grand Architect', description: 'Reach Level 30.', icon: 'award', criteriaType: 'LEVEL_UP', criteriaValue: 30, category: 'LEVELS', xpReward: 1500 },
  { name: 'Sentinel', description: 'Reach Level 40.', icon: 'award', criteriaType: 'LEVEL_UP', criteriaValue: 40, category: 'LEVELS', xpReward: 2000 },
  { name: 'Demigod', description: 'Reach Level 50.', icon: 'zap', criteriaType: 'LEVEL_UP', criteriaValue: 50, category: 'LEVELS', xpReward: 2500 },
  { name: 'Overlord', description: 'Reach Level 75.', icon: 'zap', criteriaType: 'LEVEL_UP', criteriaValue: 75, category: 'LEVELS', xpReward: 4000 },
  { name: 'Apex Engineer', description: 'Reach Level 100.', icon: 'zap', criteriaType: 'LEVEL_UP', criteriaValue: 100, category: 'LEVELS', xpReward: 5000 },

  // Skill Count badges (1st, 3rd, 10th, 25th, 50th, 75th, 100th skills; 5th is Knowledge Collector)
  { name: 'First Step', description: 'Add your first skill.', icon: 'book', criteriaType: 'SKILL_COUNT', criteriaValue: 1, category: 'SPECIAL', xpReward: 50 },
  { name: 'Collector', description: 'Add 3 skills.', icon: 'book', criteriaType: 'SKILL_COUNT', criteriaValue: 3, category: 'SPECIAL', xpReward: 150 },
  { name: 'Master of Arts', description: 'Add 10 skills.', icon: 'book-open', criteriaType: 'SKILL_COUNT', criteriaValue: 10, category: 'SPECIAL', xpReward: 350 },
  { name: 'High Scholar', description: 'Add 25 skills.', icon: 'book-open', criteriaType: 'SKILL_COUNT', criteriaValue: 25, category: 'SPECIAL', xpReward: 750 },
  { name: 'Ultimate Polymath', description: 'Add 50 skills.', icon: 'book-open', criteriaType: 'SKILL_COUNT', criteriaValue: 50, category: 'SPECIAL', xpReward: 2000 },
  { name: 'Legendary Scholar', description: 'Add 75 skills.', icon: 'book-open', criteriaType: 'SKILL_COUNT', criteriaValue: 75, category: 'SPECIAL', xpReward: 3000 },
  { name: 'Apex Omniscient', description: 'Add 100 skills.', icon: 'book-open', criteriaType: 'SKILL_COUNT', criteriaValue: 100, category: 'SPECIAL', xpReward: 5000 },

  // Project Count badges
  { name: 'Double Down', description: 'Complete 2 projects successfully.', icon: 'target', criteriaType: 'PROJECT_COUNT', criteriaValue: 2, category: 'PROJECTS', xpReward: 350 },
  { name: 'Builder', description: 'Complete 4 projects.', icon: 'target', criteriaType: 'PROJECT_COUNT', criteriaValue: 4, category: 'PROJECTS', xpReward: 600 },
  { name: 'Creator', description: 'Complete 5 projects.', icon: 'target', criteriaType: 'PROJECT_COUNT', criteriaValue: 5, category: 'PROJECTS', xpReward: 750 },
  { name: 'Maker', description: 'Complete 6 projects.', icon: 'target', criteriaType: 'PROJECT_COUNT', criteriaValue: 6, category: 'PROJECTS', xpReward: 900 },
  { name: 'Inventor', description: 'Complete 7 projects.', icon: 'target', criteriaType: 'PROJECT_COUNT', criteriaValue: 7, category: 'PROJECTS', xpReward: 1000 },
  { name: 'Shipper', description: 'Complete 8 projects.', icon: 'rocket', criteriaType: 'PROJECT_COUNT', criteriaValue: 8, category: 'PROJECTS', xpReward: 1200 },
  { name: 'Tech Tycoon', description: 'Complete 9 projects.', icon: 'rocket', criteriaType: 'PROJECT_COUNT', criteriaValue: 9, category: 'PROJECTS', xpReward: 1350 },
  { name: 'Architect of Portfolios', description: 'Complete 10 projects.', icon: 'rocket', criteriaType: 'PROJECT_COUNT', criteriaValue: 10, category: 'PROJECTS', xpReward: 1500 },
  { name: 'Enterprise Shipper', description: 'Complete 15 projects.', icon: 'rocket', criteriaType: 'PROJECT_COUNT', criteriaValue: 15, category: 'PROJECTS', xpReward: 2200 },
  { name: 'Project Monopoly', description: 'Complete 20 projects.', icon: 'rocket', criteriaType: 'PROJECT_COUNT', criteriaValue: 20, category: 'PROJECTS', xpReward: 3000 },

  // Streak badges
  { name: 'Commitment', description: 'Maintain a 2-day coding streak.', icon: 'flame', criteriaType: 'STREAK', criteriaValue: 2, category: 'STREAKS', xpReward: 100 },
  { name: 'Consistency', description: 'Maintain a 4-day coding streak.', icon: 'flame', criteriaType: 'STREAK', criteriaValue: 4, category: 'STREAKS', xpReward: 180 },
  { name: 'Habitual', description: 'Maintain a 5-day coding streak.', icon: 'flame', criteriaType: 'STREAK', criteriaValue: 5, category: 'STREAKS', xpReward: 220 },
  { name: 'Dedicated', description: 'Maintain a 6-day coding streak.', icon: 'flame', criteriaType: 'STREAK', criteriaValue: 6, category: 'STREAKS', xpReward: 260 },
  { name: 'Unstoppable', description: 'Maintain an 8-day coding streak.', icon: 'zap', criteriaType: 'STREAK', criteriaValue: 8, category: 'STREAKS', xpReward: 350 },
  { name: 'Relentless', description: 'Maintain a 9-day coding streak.', icon: 'zap', criteriaType: 'STREAK', criteriaValue: 9, category: 'STREAKS', xpReward: 400 },
  { name: 'Super Streak', description: 'Maintain a 10-day coding streak.', icon: 'zap', criteriaType: 'STREAK', criteriaValue: 10, category: 'STREAKS', xpReward: 450 },
  { name: 'Half Month', description: 'Maintain a 15-day coding streak.', icon: 'zap', criteriaType: 'STREAK', criteriaValue: 15, category: 'STREAKS', xpReward: 700 },
  { name: 'Month Long', description: 'Maintain a 20-day coding streak.', icon: 'zap', criteriaType: 'STREAK', criteriaValue: 20, category: 'STREAKS', xpReward: 1000 },
  { name: 'Devoted Coder', description: 'Maintain a 30-day coding streak.', icon: 'zap', criteriaType: 'STREAK', criteriaValue: 30, category: 'STREAKS', xpReward: 1500 },

  // XP Badges
  { name: 'Centurion', description: 'Earn 100 total XP.', icon: 'shield', criteriaType: 'XP_TOTAL', criteriaValue: 100, category: 'SPECIAL', xpReward: 50 },
  { name: 'XP Earned', description: 'Earn 250 total XP.', icon: 'shield', criteriaType: 'XP_TOTAL', criteriaValue: 250, category: 'SPECIAL', xpReward: 100 },
  { name: 'XP Gatherer', description: 'Earn 500 total XP.', icon: 'shield', criteriaType: 'XP_TOTAL', criteriaValue: 500, category: 'SPECIAL', xpReward: 150 },
  { name: 'Gladiator', description: 'Earn 750 total XP.', icon: 'shield', criteriaType: 'XP_TOTAL', criteriaValue: 750, category: 'SPECIAL', xpReward: 200 },
];

const MASTER_SKILLS = [
  // Technologies (Frontend)
  { name: 'React', category: 'Frontend', type: 'TECHNOLOGY', description: 'Component-based UI library' },
  { name: 'Vue.js', category: 'Frontend', type: 'TECHNOLOGY', description: 'Progressive JavaScript framework' },
  { name: 'Angular', category: 'Frontend', type: 'TECHNOLOGY', description: 'TypeScript-based development platform' },
  { name: 'Svelte', category: 'Frontend', type: 'TECHNOLOGY', description: 'Cybernetic web framework compiler' },
  { name: 'Tailwind CSS', category: 'Frontend', type: 'TECHNOLOGY', description: 'Utility-first styling framework' },
  { name: 'TypeScript', category: 'Frontend', type: 'TECHNOLOGY', description: 'Strict syntactical superset of JavaScript' },
  { name: 'JavaScript', category: 'Frontend', type: 'TECHNOLOGY', description: 'Foundational programming language of the web' },
  { name: 'Next.js', category: 'Frontend', type: 'TECHNOLOGY', description: 'React framework for production grade applications' },
  { name: 'Nuxt.js', category: 'Frontend', type: 'TECHNOLOGY', description: 'Intuitive Vue framework for web development' },
  { name: 'Apollo Client', category: 'Frontend', type: 'TECHNOLOGY', description: 'State management library for JavaScript to manage GraphQL data' },
  
  // Technologies (Backend)
  { name: 'Node.js', category: 'Backend', type: 'TECHNOLOGY', description: 'Asynchronous event-driven JavaScript server runtime' },
  { name: 'Express', category: 'Backend', type: 'TECHNOLOGY', description: 'Minimalist web framework for Node.js' },
  { name: 'NestJS', category: 'Backend', type: 'TECHNOLOGY', description: 'Progressive Node.js framework for enterprise architectures' },
  { name: 'Python', category: 'Backend', type: 'TECHNOLOGY', description: 'High-level, general-purpose scripting language' },
  { name: 'Go', category: 'Backend', type: 'TECHNOLOGY', description: 'Statically typed concurrent programming language' },
  { name: 'Rust', category: 'Backend', type: 'TECHNOLOGY', description: 'Memory-safe systems programming language' },
  { name: 'Django', category: 'Backend', type: 'TECHNOLOGY', description: 'High-level Python web framework' },
  { name: 'Fastify', category: 'Backend', type: 'TECHNOLOGY', description: 'Highly efficient, low overhead web framework for Node.js' },
  { name: 'GraphQL', category: 'Backend', type: 'TECHNOLOGY', description: 'Query language for APIs and runtime for fulfilling queries' },
  { name: 'Flask', category: 'Backend', type: 'TECHNOLOGY', description: 'Micro web framework written in Python' },
  { name: 'Spring Boot', category: 'Backend', type: 'TECHNOLOGY', description: 'Convention-over-configuration Java framework' },
  { name: 'ASP.NET Core', category: 'Backend', type: 'TECHNOLOGY', description: 'Open-source web framework by Microsoft' },

  // Technologies (Database & DevOps)
  { name: 'MongoDB', category: 'Database', type: 'TECHNOLOGY', description: 'Document-based NoSQL database engine' },
  { name: 'PostgreSQL', category: 'Database', type: 'TECHNOLOGY', description: 'Object-relational database management system' },
  { name: 'MySQL', category: 'Database', type: 'TECHNOLOGY', description: 'Open-source relational database management system' },
  { name: 'Redis', category: 'Database', type: 'TECHNOLOGY', description: 'In-memory data structure store and cache' },
  { name: 'Elasticsearch', category: 'Database', type: 'TECHNOLOGY', description: 'Distributed search and analytics engine' },
  { name: 'Cassandra', category: 'Database', type: 'TECHNOLOGY', description: 'Distributed NoSQL database management system' },
  { name: 'SQLite', category: 'Database', type: 'TECHNOLOGY', description: 'C-language library that implements a SQL database engine' },
  { name: 'Docker', category: 'DevOps', type: 'TECHNOLOGY', description: 'OS-level virtualization container tool' },
  { name: 'Kubernetes', category: 'DevOps', type: 'TECHNOLOGY', description: 'Container orchestration platform' },
  { name: 'Git', category: 'DevOps', type: 'TECHNOLOGY', description: 'Distributed version control system' },
  { name: 'AWS', category: 'DevOps', type: 'TECHNOLOGY', description: 'Amazon Web Services cloud platform' },
  { name: 'Google Cloud', category: 'DevOps', type: 'TECHNOLOGY', description: 'Google Cloud Platform hosting infrastructure' },
  { name: 'Firebase', category: 'DevOps', type: 'TECHNOLOGY', description: 'Google backend-as-a-service platform' },
  { name: 'Supabase', category: 'DevOps', type: 'TECHNOLOGY', description: 'Open-source Firebase alternative' },
  { name: 'Terraform', category: 'DevOps', type: 'TECHNOLOGY', description: 'Infrastructure as Code provisioning tool' },
  { name: 'Ansible', category: 'DevOps', type: 'TECHNOLOGY', description: 'Configuration management and deployment tool' },
  { name: 'Jenkins', category: 'DevOps', type: 'TECHNOLOGY', description: 'Open source automation server for CI/CD' },
  { name: 'GitHub Actions', category: 'DevOps', type: 'TECHNOLOGY', description: 'Automate software workflows directly in GitHub' },
  { name: 'Vercel', category: 'DevOps', type: 'TECHNOLOGY', description: 'Cloud platform for static sites and Serverless Functions' },
  { name: 'Netlify', category: 'DevOps', type: 'TECHNOLOGY', description: 'Web development platform for modern web projects' },
  
  // Skills (Frontend)
  { name: 'UI/UX Design & Layout', category: 'Frontend', type: 'SKILL', description: 'Visual design, usability, wireframes, and design systems' },
  { name: 'State Management', category: 'Frontend', type: 'SKILL', description: 'Redux, MobX, Context API, and global state paradigms' },
  { name: 'Responsive Web Design', category: 'Frontend', type: 'SKILL', description: 'Fluid layouts, media queries, flexbox, and grid structures' },
  { name: 'Web Performance Optimization', category: 'Frontend', type: 'SKILL', description: 'Bundling, lazy loading, caching, CDN, and asset optimization' },
  
  // Skills (Backend)
  { name: 'REST API Design', category: 'Backend', type: 'SKILL', description: 'API routes, HTTP methods, status codes, and request payloads' },
  { name: 'Authentication & Security', category: 'Backend', type: 'SKILL', description: 'JWT, OAuth, hashing, CORS, and vulnerability patching' },
  { name: 'Microservices Architecture', category: 'Backend', type: 'SKILL', description: 'Event buses, message brokers, gateway routing, and service isolation' },
  { name: 'System Design & Scaling', category: 'Backend', type: 'SKILL', description: 'Load balancers, replication, partitioning, and architectural scalability' },
  { name: 'OAuth2 & OpenID Connect', category: 'Backend', type: 'SKILL', description: 'Authorization grant types, token verification, and Identity Providers' },
  { name: 'Test-Driven Development (TDD)', category: 'Backend', type: 'SKILL', description: 'Unit testing, integration testing, mocking, and assertion suites' },
  { name: 'Web Sockets & Real-Time Sync', category: 'Backend', type: 'SKILL', description: 'Event-driven bi-directional communication channels' },
  { name: 'Clean Code & Refactoring', category: 'Backend', type: 'SKILL', description: 'SOLID principles, design patterns, and code maintainability improvements' },
  { name: 'Serverless Architectures', category: 'Backend', type: 'SKILL', description: 'Function-as-a-service, micro-billing, and cold start optimizations' },
  { name: 'Threat Modeling & Web Application Security', category: 'Backend', type: 'SKILL', description: 'OWASP Top 10, penetration testing, and security posture reinforcement' },

  // Skills (Database & DevOps)
  { name: 'Database Indexing & Query Tuning', category: 'Database', type: 'SKILL', description: 'Query analysis, explain plans, indexing types, and execution speed' },
  { name: 'Database Schema Normalization', category: 'Database', type: 'SKILL', description: 'Relational design, normal forms, and relationship modeling' },
  { name: 'CI/CD Pipelines & Automation', category: 'DevOps', type: 'SKILL', description: 'Build actions, test runners, deployment automation, and workflow hooks' },
  { name: 'Infrastructure as Code', category: 'DevOps', type: 'SKILL', description: 'Terraform, CloudFormation, and cloud resource provisioning declarative models' },
  { name: 'Dockerizing Applications', category: 'DevOps', type: 'SKILL', description: 'Multi-stage builds, base image optimization, and container networks' },
  { name: 'Monorepo Architecture', category: 'DevOps', type: 'SKILL', description: 'Shared workspaces, selective builds, and package version alignment' },
  
  // New Seeded Technologies & Skills
  { name: 'Sass', category: 'Frontend', type: 'TECHNOLOGY', description: 'CSS extension language adding variables and nested rules' },
  { name: 'Bootstrap', category: 'Frontend', type: 'TECHNOLOGY', description: 'Popular CSS framework for developing responsive web projects' },
  { name: 'Vite', category: 'Frontend', type: 'TECHNOLOGY', description: 'Next-generation rapid frontend build tool' },
  { name: 'PHP', category: 'Backend', type: 'TECHNOLOGY', description: 'Popular server-side general purpose scripting language' },
  { name: 'Laravel', category: 'Backend', type: 'TECHNOLOGY', description: 'PHP web application framework with expressive syntax' },
  { name: 'Java', category: 'Backend', type: 'TECHNOLOGY', description: 'Class-based object-oriented backend programming language' },
  { name: 'C#', category: 'Backend', type: 'TECHNOLOGY', description: 'General purpose multi-paradigm object-oriented language' },
  { name: 'gRPC', category: 'Backend', type: 'TECHNOLOGY', description: 'High-performance RPC framework by Google' },
  { name: 'DynamoDB', category: 'Database', type: 'TECHNOLOGY', description: 'Fully managed proprietary NoSQL database service by AWS' },
  { name: 'Microsoft Azure', category: 'DevOps', type: 'TECHNOLOGY', description: 'Cloud computing platform operated by Microsoft' },
  { name: 'Grafana', category: 'DevOps', type: 'TECHNOLOGY', description: 'Multi-platform open source analytics and visualization web app' },
  { name: 'SPA Routing', category: 'Frontend', type: 'SKILL', description: 'Client-side routing transitions without page reloads' },
  { name: 'Server-Side Rendering (SSR)', category: 'Frontend', type: 'SKILL', description: 'Pre-rendering pages on the server for improved SEO and paint times' },
  { name: 'Web Accessibility (a11y)', category: 'Frontend', type: 'SKILL', description: 'Designing web applications accessible to people with disabilities' },
  { name: 'Caching Strategies', category: 'Backend', type: 'SKILL', description: 'In-memory caching policies, TTL, and cache invalidation' },
  { name: 'Rate Limiting & Throttling', category: 'Backend', type: 'SKILL', description: 'Preventing abuse by limiting API requests using token bucket' },
  { name: 'Message Queues & Event-Driven', category: 'Backend', type: 'SKILL', description: 'Asynchronous event processing using RabbitMQ, Kafka, or BullMQ' },
  { name: 'Database Replication & Failover', category: 'Database', type: 'SKILL', description: 'Read replicas, multi-primary synchronization, and automatic failovers' },
  { name: 'Continuous Deployment (CD)', category: 'DevOps', type: 'SKILL', description: 'Automating continuous code deployments to staging/production' },
  { name: 'Container Orchestration & Tuning', category: 'DevOps', type: 'SKILL', description: 'Managing distributed clusters using Kubernetes replicas and resources' },
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

    // Clean up invalid skills from existing StudentStats
    console.log('Cleaning up invalid skills from existing student profiles...');
    const invalidNames = ['groq api', 'groq ai', 'groq', 'celery', 'prisma'];
    const cleanResult = await StudentStats.updateMany(
      {},
      {
        $pull: {
          skills: {
            name: { $in: invalidNames.map(name => new RegExp(`^${name}$`, 'i')) }
          }
        }
      }
    );
    console.log(`Cleaned up invalid skills from student stats. Modified document count: ${cleanResult.modifiedCount}`);

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

module.exports = { seedDB, BADGES, MASTER_SKILLS };
