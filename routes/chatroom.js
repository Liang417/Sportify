import { Router } from 'express';
import { getChatroom } from '../controllers/chatroom';
import userAuth from '../middleware/auth';

const router = Router();

router.get('/chatroom/:id', userAuth, getChatroom);

export default router;
