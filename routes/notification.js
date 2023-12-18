import express from 'express';
import { getNotifications } from '../controllers/notification';
import userAuth from '../middleware/auth';

const router = express.Router();

router.get('/notification', userAuth, getNotifications);

export default router;
