const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const StudentStats = require('../models/StudentStats');
const config = require('../config/env');

const DEFAULT_MILESTONES = [
  {
    index: 1,
    title: 'Project Setup & Design Planning',
    description: 'Set up the repository, define database schemas, and create wireframes/architecture planning documentation.',
  },
  {
    index: 2,
    title: 'Core Backend Development',
    description: 'Implement database models, build core API routes/endpoints, and verify connectivity.',
  },
  {
    index: 3,
    title: 'Frontend Integration & UI Core',
    description: 'Build core UI pages, integrate client-side routing, and connect authentication screens.',
  },
  {
    index: 4,
    title: 'Advanced Features & Socket Sync',
    description: 'Implement real-time updates using Socket.io, direct messaging, or file upload pipelines.',
  },
  {
    index: 5,
    title: 'Testing, Deployment & Documentation',
    description: 'Write test cases, debug edge cases, deploy the project online, and write a clear README.',
  },
];

const MOCK_PROJECTS_POOL = [
  {
    title: 'DevFlow: Developer Forum Platform',
    description: 'A full-stack question and answer platform for developer teams, featuring search, notifications, and code snippet sharing.',
    techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'TailwindCSS'],
    githubUrl: 'https://github.com/WolverineAryan/DevFlow',
    liveUrl: 'https://devflow-showcase.vercel.app',
  },
  {
    title: 'GitMetrics: GitHub Analytics Dashboard',
    description: 'A web dashboard visualizing GitHub repository metrics, commit velocity, and language breakdown.',
    techStack: ['Vite', 'Recharts', 'Supabase', 'GitHub API', 'CSS Grid'],
    githubUrl: 'https://github.com/WolverineAryan/GitMetrics',
    liveUrl: 'https://gitmetrics.vercel.app',
  },
  {
    title: 'PayGuard: Fintech Checkout Gateway',
    description: 'A secure fintech payment gateway simulation with mock card validation, invoice generation, and transaction logging.',
    techStack: ['React', 'Next.js', 'Stripe API', 'PostgreSQL', 'TailwindCSS'],
    githubUrl: 'https://github.com/WolverineAryan/PayGuard',
    liveUrl: 'https://payguard-checkout.vercel.app',
  },
  {
    title: 'ChatSync: Real-time Collaborative Chat',
    description: 'A collaborative web chat client utilizing WebSocket connections for low-latency messaging, active user tracking, and chat rooms.',
    techStack: ['React', 'Socket.io', 'Node.js', 'Redis', 'TailwindCSS'],
    githubUrl: 'https://github.com/WolverineAryan/ChatSync',
    liveUrl: 'https://chatsync-live.vercel.app',
  },
  {
    title: 'TaskMesh: Kanban Project Planner',
    description: 'A project planning utility featuring draggable task cards, project boards, and team assignment selectors.',
    techStack: ['Vue', 'Express', 'PostgreSQL', 'Docker', 'CSS Modules'],
    githubUrl: 'https://github.com/WolverineAryan/TaskMesh',
    liveUrl: 'https://taskmesh.vercel.app',
  },
  {
    title: 'CodeCraft: Interactive Online Editor',
    description: 'An online developer sandbox compilation system enabling live code compilation, preview rendering, and Monaco editor interfaces.',
    techStack: ['React', 'Monaco Editor', 'Docker', 'Node.js', 'Express'],
    githubUrl: 'https://github.com/WolverineAryan/CodeCraft',
    liveUrl: 'https://codecraft-editor.vercel.app',
  },
  {
    title: 'NutriFit: Health Tracker & AI Planner',
    description: 'A mobile health companion app integrating caloric intake calculations, fitness statistics, and OpenAI meal plans.',
    techStack: ['React Native', 'Flask', 'SQLite', 'OpenAI API', 'Chart.js'],
    githubUrl: 'https://github.com/WolverineAryan/NutriFit',
    liveUrl: '',
  },
  {
    title: 'ShopWave: E-Commerce Storefront',
    description: 'A modern e-commerce storefront with shopping cart integration, product catalogs, and administrative checkout reviews.',
    techStack: ['Next.js', 'GraphQL', 'Shopify API', 'TailwindCSS', 'MongoDB'],
    githubUrl: 'https://github.com/WolverineAryan/ShopWave',
    liveUrl: 'https://shopwave-ecommerce.vercel.app',
  },
  {
    title: 'EcoTrack: Carbon Footprint Tracker',
    description: 'An eco-initiative calculation utility tracking individual emission metrics, local offset points, and global challenges.',
    techStack: ['Angular', 'Express', 'MongoDB', 'Leaflet.js', 'CSS Grid'],
    githubUrl: 'https://github.com/WolverineAryan/EcoTrack',
    liveUrl: '',
  },
  {
    title: 'AeroSpace: Flight Delay Prediction',
    description: 'A data visualizer calculating aviation delay ratios using public flight schedules and predictive metrics.',
    techStack: ['Svelte', 'Python', 'FastAPI', 'Pandas', 'Chart.js'],
    githubUrl: 'https://github.com/WolverineAryan/AeroSpace',
    liveUrl: 'https://aerospace-prediction.vercel.app',
  },
];

const MOCK_SKILLS_POOL = [
  { name: 'React', category: 'Frontend', tier: 'BASIC', type: 'TECHNOLOGY' },
  { name: 'Node.js', category: 'Backend', tier: 'BASIC', type: 'TECHNOLOGY' },
  { name: 'Express', category: 'Backend', tier: 'BASIC', type: 'TECHNOLOGY' },
  { name: 'MongoDB', category: 'Database', tier: 'BASIC', type: 'TECHNOLOGY' },
  { name: 'RESTful API Development', category: 'Backend', tier: 'BASIC', type: 'SKILL' },
  { name: 'State Management (Zustand/Redux)', category: 'Frontend', tier: 'BASIC', type: 'SKILL' },
  { name: 'TailwindCSS', category: 'Frontend', tier: 'BASIC', type: 'TECHNOLOGY' },
  { name: 'CSS Grid & Responsive Design', category: 'Frontend', tier: 'BASIC', type: 'SKILL' },
];

const runSeeder = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(config.mongoUri);
    console.log('Database connected.');

    // Fetch all student users
    const students = await User.find({ role: 'STUDENT' });
    console.log(`Found ${students.length} students in the database.`);

    let seededCount = 0;

    for (const student of students) {
      // Find or create their stats
      let stats = await StudentStats.findOne({ user: student._id });
      if (!stats) {
        stats = await StudentStats.create({
          user: student._id,
          xp: 0,
          level: 1,
          streak: 0,
          skills: [],
        });
      }

      // STRICT PROTECTION: Only modify users with 0 XP
      if (stats.xp > 0) {
        console.log(`Skipping active student user (has original XP): ${student.name} (${stats.xp} XP)`);
        continue;
      }

      // Check if student already has projects to avoid duplicate seeds on multiple runs
      const projectCount = await Project.countDocuments({ student: student._id });
      if (projectCount > 0) {
        console.log(`Skipping student user (already has projects seeded): ${student.name}`);
        continue;
      }

      // Add basic skills to stats
      stats.skills = MOCK_SKILLS_POOL;
      await stats.save();

      // Shuffle project templates and pick 1 or 2 random projects
      const shuffledTemplates = [...MOCK_PROJECTS_POOL].sort(() => 0.5 - Math.random());
      const projectsCountToSeed = Math.floor(Math.random() * 2) + 1; // 1 or 2 projects
      const selectedTemplates = shuffledTemplates.slice(0, projectsCountToSeed);

      console.log(`Seeding ${projectsCountToSeed} project(s) for user: ${student.name} (${student.email})`);

      for (let i = 0; i < selectedTemplates.length; i++) {
        const template = selectedTemplates[i];
        
        // Randomize status
        const statuses = ['PLANNING', 'IN_PROGRESS', 'COMPLETED'];
        const randomStatus = i === 0 ? 'IN_PROGRESS' : statuses[Math.floor(Math.random() * statuses.length)];

        const project = await Project.create({
          title: template.title,
          description: template.description,
          student: student._id,
          techStack: template.techStack,
          githubUrl: template.githubUrl,
          liveUrl: template.liveUrl,
          status: randomStatus,
        });

        // If COMPLETED, set all milestones to COMPLETED. Otherwise, set 1st to ACTIVE, rest to LOCKED
        const milestones = DEFAULT_MILESTONES.map((m) => {
          let status = 'LOCKED';
          if (randomStatus === 'COMPLETED') {
            status = 'COMPLETED';
          } else {
            status = m.index === 1 ? 'ACTIVE' : 'LOCKED';
          }
          return {
            project: project._id,
            index: m.index,
            title: m.title,
            description: m.description,
            status,
            aiScore: randomStatus === 'COMPLETED' ? Math.floor(Math.random() * 20) + 80 : 0,
            aiFeedback: randomStatus === 'COMPLETED' ? 'Excellent implementation of this milestone!' : '',
          };
        });
        
        await Milestone.insertMany(milestones);
      }

      seededCount++;
    }

    console.log(`Successfully seeded diverse projects and skills for ${seededCount} student(s) with 0 XP.`);
    process.exit(0);
  } catch (error) {
    console.error('Error running seeder:', error);
    process.exit(1);
  }
};

runSeeder();
