const cron = require("node-cron");
const { detectStagnation } = require("../services/stagnation.service");

cron.schedule("0 2 * * *", async () => {
  console.log("Running stagnation detection...");
  await detectStagnation();
});
