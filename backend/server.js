require("dotenv").config();

const app = require("./app");
const connectDB = require("./src/config/db");

require("./src/events/listeners");
require("./src/jobs/stagnation.job");

const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;

// ---------------- DB ----------------
connectDB();

// ---------------- ROUTES ----------------
const analyticsRoutes = require("./src/routes/analytics.routes");
const aiInsightsRoutes = require("./src/routes/aiInsights.routes");

app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai-insights", aiInsightsRoutes);

// ---------------- STATIC FILES ----------------
app.use("/uploads", require("express").static("uploads"));

// ---------------- SERVER ----------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

global.io = io;

io.on("connection", (socket) => {
  socket.on("join-project", (projectId) => {
    socket.join(projectId);
  });
});

// ---------------- START ----------------
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});