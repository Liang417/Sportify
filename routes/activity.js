import { Router } from 'express';
import {
  createActivity,
  getTypes,
  searchActivities,
  getActivityDetail,
  attendActivity,
  getActivities,
  cancelAttendActivity,
  deleteActivity,
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
router.patch('/activity/:id/attend/', userAuth, attendActivity);
router.patch('/activity/:id/cancel/', userAuth, cancelAttendActivity);
router.delete('/activity/:id', userAuth, deleteActivity);
router.get('/activities/search', searchActivities);
router.get('/activity/detail/:id', getActivityDetail);
router.get('/activity/types', getTypes);
router.get('/activities/', getActivities);

export default router;
