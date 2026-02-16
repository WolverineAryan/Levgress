require("dotenv").config();
const app = require("./app");
const connectDB = require("./src/config/db");
require("./src/events/listeners");
require("./src/jobs/stagnation.job");
const http = require("http");
const PORT = process.env.PORT || 5000;

connectDB();
require("./src/events/listeners");

const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*" }
});

global.io = io; 
io.on("connection", (socket) => {

  socket.on("join-project", (projectId) => {
    socket.join(projectId);
  });

});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
