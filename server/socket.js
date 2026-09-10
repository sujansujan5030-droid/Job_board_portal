import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    socket.on('join-room', ({ roomId, userName, role }) => {
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.userName = userName;
      socket.data.role = role;

      socket.to(roomId).emit('user-connected', { userName, role, socketId: socket.id });
      socket.emit('room-joined', { roomId, userName, role, socketId: socket.id });
    });

    socket.on('send-offer', ({ roomId, offer, senderName, senderRole }) => {
      socket.to(roomId).emit('receive-offer', { offer, senderName, senderRole, socketId: socket.id });
    });

    socket.on('send-answer', ({ roomId, answer, senderName, senderRole }) => {
      socket.to(roomId).emit('receive-answer', { answer, senderName, senderRole, socketId: socket.id });
    });

    socket.on('send-ice-candidate', ({ roomId, candidate, senderName, senderRole }) => {
      socket.to(roomId).emit('receive-ice-candidate', { candidate, senderName, senderRole, socketId: socket.id });
    });

    socket.on('leave-room', ({ roomId }) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', { socketId: socket.id });
    });

    socket.on('disconnect', () => {
      if (socket.data.roomId) {
        socket.to(socket.data.roomId).emit('user-left', { socketId: socket.id });
      }
    });
  });

  return io;
};

export const getSocket = () => io;
