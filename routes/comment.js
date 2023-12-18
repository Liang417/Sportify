import express from 'express';
import { body, param } from 'express-validator';
import { createComment, getComments } from '../controllers/comment';
import userAuth from '../middleware/auth';
import handleResult from '../middleware/validator';

const router = express.Router();

router.get('/activity/:activityId/comments', [param('activityId').notEmpty().isInt(), getComments]);
router.post('/activity/:activityId/comment', [
  param('activityId').notEmpty().isInt(),
  body('content').notEmpty().isString(),
  body('title').notEmpty().isString(),
  handleResult,
  userAuth,
  createComment,
]);

export default router;
