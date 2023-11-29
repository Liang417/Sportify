import { Router } from 'express';
import {
  signIn,
  signUp,
  getUser,
  getAllUsers,
  getActivities,
} from '../controllers/user';
import upload from '../middleware/multer';
import userAuth from '../middleware/auth';

const router = Router();

router.post(
  '/user/signup',
  upload.fields([{ name: 'avatar', maxCount: 1 }]),
  signUp,
);
router.post('/user/signin', signIn);
router.get('/users/', getAllUsers);
router.get('/user/', userAuth, getUser);
router.get('/user/activities', userAuth, getActivities);

export default router;
