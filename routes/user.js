import { Router } from 'express';
import { signIn, signUp } from '../controllers/user';
import upload from '../middleware/multer';

const router = Router();

router.post('/user/signup', upload.fields([{ name: 'avatar', maxCount: 1 }]), signUp);
router.post('/user/signin', signIn);

export default router;
