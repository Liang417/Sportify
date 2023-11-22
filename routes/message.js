import { Router } from 'express';
import userAuth from '../middleware/auth';
import { createMessage, getMessages } from '../controllers/message';

const router = Router();

router.post('/message/', userAuth, createMessage);
router.get('/message/:chatroomId', userAuth, getMessages);

export default router;