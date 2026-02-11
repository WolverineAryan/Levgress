const Skill = require("../models/Skill");

module.exports = async function seedSkills() {
  const skills = [
    // Programming
    { name: "JavaScript", category: "Programming", domain: "Web" },
    { name: "Python", category: "Programming", domain: "General" },
    { name: "Java", category: "Programming", domain: "Backend" },

    // Web
    { name: "React", category: "Framework", domain: "Web" },
    { name: "Node.js", category: "Backend", domain: "Web" },

    // App
    { name: "Android Development", category: "Mobile", domain: "App" },

    // Database
    { name: "MongoDB", category: "Database", domain: "Backend" },

    // Soft Skills
    { name: "Problem Solving", category: "Soft Skill", domain: "General" }
  ];

  for (const skill of skills) {
    await Skill.updateOne(
      { name: skill.name },
      { $setOnInsert: skill },
      { upsert: true }
    );
  }

  console.log("✅ Skills seeded");
};
