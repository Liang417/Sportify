import { Router } from 'express';
import { body, param } from 'express-validator';
import userAuth from '../middleware/auth';
import { createMessage, getMessages } from '../controllers/message';
import handleResult from '../middleware/validator';

const router = Router();

router.post('/message/', [
  body('chatroomId').notEmpty().isInt(),
  body('content').notEmpty().isString(),
  handleResult,
  userAuth,
  createMessage,
]);
router.get('/messages/:chatroomId', [
  param('chatroomId').notEmpty().isInt(),
  handleResult,
  userAuth,
  getMessages,
]);

export default router;
