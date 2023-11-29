import express from 'express';
import { createNotification, getNotifications } from '../controllers/notification';
import userAuth from '../middleware/auth';

const router = express.Router();

router.get('/notification', userAuth, getNotifications);
router.post('/notification', userAuth, createNotification);

export default router;
