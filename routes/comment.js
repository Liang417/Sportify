import express from 'express';
import { createComment, getComments } from '../controllers/comment';
import userAuth from '../middleware/auth';

const router = express.Router();

router.get('/activity/:activityId/comments', getComments);
router.post('/activity/:activityId/comment', userAuth, createComment);

export default router;
