import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import { errorHandler } from './utils/errorHandler';
import activityRouter from './routes/activity';
import userRouter from './routes/user';
import chatroomRouter from './routes/chatroom';
import messageRouter from './routes/message';

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', [activityRouter, userRouter, chatroomRouter, messageRouter]);
app.use(errorHandler);

io.on('connection', (socket) => {
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  });

  socket.on('chat message', (msg, roomId) => {
    io.to(roomId).emit('chat message', msg);
  });
});

server.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on ${process.env.PORT}`);
});
