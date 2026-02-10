const eventBus = require("./dispatcher");
const EVENTS = require("./constants");
const { logActivity } = require("../services/activity.service");

// LEVEL UP
eventBus.on(EVENTS.LEVEL_UP, async ({ studentId, level }) => {
  await logActivity({
    userId: studentId,
    type: "LEVEL_UP",
    message: `reached Level ${level}`
  });

  global.io?.to(studentId.toString()).emit("level-up", { level });
});

// PROJECT COMPLETED
eventBus.on(EVENTS.PROJECT_COMPLETED, async ({ studentId }) => {
  await logActivity({
    userId: studentId,
    type: "PROJECT_COMPLETED",
    message: `completed a project`
  });

  global.io?.emit("activity-update");
});

// SKILL LEARNED
eventBus.on(EVENTS.SKILL_LEARNED, async ({ studentId }) => {
  await logActivity({
    userId: studentId,
    type: "SKILL_LEARNED",
    message: `learned a new skill`
  });
});
