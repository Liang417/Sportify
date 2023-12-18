import { Router } from 'express';
import {
  signIn, signUp, getUser, getActivities, signOut,
} from '../controllers/user';
import upload from '../middleware/multer';
import userAuth from '../middleware/auth';

const router = Router();

router.post('/user/signup', [upload.fields([{ name: 'avatar', maxCount: 1 }]), signUp]);
router.post('/user/signin', signIn);
router.get('/user/', userAuth, getUser);
router.get('/user/activities', userAuth, getActivities);
router.get('/user/signout', signOut);

export default router;
