const mongoose = require("mongoose");
const dotenv = require("dotenv");
const MasterSkill = require("./models/MasterSkill");

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const skills = [
  { name: "React", category: "Frontend" },
  { name: "Node.js", category: "Backend" },
  { name: "MongoDB", category: "Database" },
  { name: "Express", category: "Backend" },
  { name: "Python", category: "Programming" },
  { name: "Machine Learning", category: "AI" }
];

const seed = async () => {
  await MasterSkill.deleteMany();
  await MasterSkill.insertMany(skills);
  console.log("Master skills seeded");
  process.exit();
};

seed();
