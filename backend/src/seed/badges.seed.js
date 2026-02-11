const Badge = require("../models/Badge");

module.exports = async function seedBadges() {
  const badges = [
    // Skill badges
    {
      name: "Skill Explorer",
      description: "Learn 5 skills",
      category: "SKILL",
      triggerEvents: ["SKILL_LEARNED"],
      criteria: { learnedSkillsCount: { "$gte": 5 } }
    },

    // Project badges
    {
      name: "Project Finisher",
      description: "Complete first project",
      category: "PROJECT",
      triggerEvents: ["PROJECT_COMPLETED"],
      criteria: { completedProjectsCount: { "$gte": 1 } }
    },

    // Level badges
    {
      name: "Level 10 Achiever",
      description: "Reach level 10",
      category: "LEVEL",
      triggerEvents: ["LEVEL_UP"],
      criteria: { level: { "$gte": 10 } }
    },

    {
      name: "Level 25 Achiever",
      description: "Reach level 25",
      category: "LEVEL",
      triggerEvents: ["LEVEL_UP"],
      criteria: { level: { "$gte": 25 } }
    },

    // Consistency badge
    {
      name: "Consistent Learner",
      description: "Active for 30 days",
      category: "CONSISTENCY",
      triggerEvents: ["LEVEL_UP"],
      criteria: { lifetimeXP: { "$gte": 1500 } }
    }
  ];

  for (const badge of badges) {
    await Badge.updateOne(
      { name: badge.name },
      { $setOnInsert: badge },
      { upsert: true }
    );
  }

  console.log("🏅 Badges seeded");
};
