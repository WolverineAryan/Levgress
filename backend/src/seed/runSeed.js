require("dotenv").config();
const connectDB = require("../config/db");

const seedSkills = require("./skills.seed");
const seedBadges = require("./badges.seed");

async function run() {
  await connectDB();

  await seedSkills();
  await seedBadges();

  console.log("🌱 Seeding complete");
  process.exit();
}

run();
