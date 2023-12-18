import { Router } from 'express';
import { body } from 'express-validator';
import { createChatroom, getGroupChatrooms, getPrivateChatrooms } from '../controllers/chatroom';
import userAuth from '../middleware/auth';
import handleResult from '../middleware/validator';

const router = Router();

router.get('/chatrooms/private', userAuth, getPrivateChatrooms);
router.get('/chatrooms/group', userAuth, getGroupChatrooms);
router.post('/chatroom/', [
  body('userId').notEmpty().isInt(),
  handleResult,
  userAuth,
  createChatroom,
]);

export default router;
