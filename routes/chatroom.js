import { Router } from 'express';
import { createChatroom, getGroupChatrooms, getPrivateChatrooms } from '../controllers/chatroom';
import userAuth from '../middleware/auth';

const router = Router();

router.get('/chatrooms/private', userAuth, getPrivateChatrooms);
router.get('/chatrooms/group', userAuth, getGroupChatrooms);
router.post('/chatroom/', userAuth, createChatroom);

export default router;
