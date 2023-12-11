import express from 'express';
import { createServer } from 'node:http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { errorHandler } from './utils/errorHandler';
import activityRouter from './routes/activity';
import userRouter from './routes/user';
import chatroomRouter from './routes/chatroom';
import messageRouter from './routes/message';
import notificationRouter from './routes/notification';
import commentRouter from './routes/comment';
import tagRouter from './routes/tag';
import { init as initSocket } from './socket';

const app = express();
const server = createServer(app);
const io = initSocket(server);

app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', [
  activityRouter,
  userRouter,
  chatroomRouter,
  messageRouter,
  notificationRouter,
  commentRouter,
  tagRouter,
]);
app.use(errorHandler);

app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

server.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on ${process.env.PORT}`);
});
