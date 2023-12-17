import { Server } from 'socket.io';

let io;

export const init = (httpServer) => {
  io = new Server(httpServer);

  io.on('connection', (socket) => {
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
    });

    socket.on('sendMessage', (message) => {
      io.to(message.chatroom_id).emit('getMessage', message);
    });

    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
