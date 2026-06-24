let io;

module.exports = {
  init: (server, corsOptions) => {
    const { Server } = require('socket.io');
    io = new Server(server, {
      cors: corsOptions,
    });

    io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Allow users to join a room with their userId
      socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their personal room`);
      });

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
  sendToUser: (userId, eventName, data) => {
    if (io) {
      io.to(userId).emit(eventName, data);
    }
  },
  emitToAll: (eventName, data) => {
    if (io) {
      io.emit(eventName, data);
    }
  },
};
