import { Router } from 'express';
import {
  createActivity,
  getTypes,
  searchActivities,
  getActivityDetail,
  attendActivity,
} from '../controllers/activity';
import userAuth from '../middleware/auth';
import upload from '../middleware/multer';

const router = Router();

router.post(
  '/activity',
  upload.fields([{ name: 'picture', maxCount: 1 }]),
  userAuth,
  createActivity,
);
router.patch('/activity/attend/:id', userAuth, attendActivity);
router.get('/activity/search', searchActivities);
router.get('/activity/detail/:id', getActivityDetail);
router.get('/activity/types', getTypes);

export default router;
