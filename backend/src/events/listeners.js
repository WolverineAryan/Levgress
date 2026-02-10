const eventBus = require("./dispatcher");
const EVENTS = require("./constants");
const XP = require("../services/xp.rules");
const { addXP } = require("../services/xp.service");
const { evaluateBadges } = require("./badge.engine");

eventBus.on(EVENTS.SKILL_LEARNED, async ({ studentId }) => {
  await addXP(studentId, XP.SKILL_LEARNED);
});

eventBus.on(EVENTS.PROJECT_CREATED, async ({ studentId }) => {
  await addXP(studentId, XP.PROJECT_CREATED);
});

eventBus.on(EVENTS.MILESTONE_APPROVED, async ({ studentId }) => {
  await addXP(studentId, XP.MILESTONE_APPROVED);
});

eventBus.on(EVENTS.PROJECT_COMPLETED, async ({ studentId }) => {
  await addXP(studentId, XP.PROJECT_COMPLETED);
});
Object.values(EVENTS).forEach(eventType => {
  eventBus.on(eventType, async ({ studentId }) => {
    await evaluateBadges(eventType, studentId);
  });
});
