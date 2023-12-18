import { Router } from 'express';
import { body, param, query } from 'express-validator';
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
import handleResult from '../middleware/validator';

const router = Router();

router.post('/activity', upload.fields([{ name: 'picture', maxCount: 1 }]), userAuth, [
  body('title').notEmpty().isLength({ max: 100 }),
  body('typeId').notEmpty(),
  body('locationName').notEmpty().isString(),
  body('latitude').notEmpty().isNumeric(),
  body('longitude').notEmpty().isNumeric(),
  body('price').isInt({ min: 0 }),
  body('attendeesLimit').isInt({ min: 2 }),
  body('startFrom').notEmpty(),
  body('endAt').notEmpty(),
  body('dateline').notEmpty(),
  body('description').notEmpty().isString(),
  body('tags').notEmpty(),
  handleResult,
  createActivity,
]);
router.patch('/activity/:id/attend/', [
  userAuth,
  param('id').not().isEmpty().trim(),
  body('chatroomId').notEmpty(),
  body('title').notEmpty().isString(),
  handleResult,
  attendActivity,
]);
router.patch('/activity/:id/cancel/', [
  userAuth,
  param('id').not().isEmpty().trim(),
  body('chatroomId').notEmpty(),
  body('title').notEmpty().isString(),
  handleResult,
  cancelAttendActivity,
]);
router.delete('/activity/:id', [param('id').not().isEmpty().trim(), userAuth, deleteActivity]);
router.get('/activities/search', [
  query('query').not().isEmpty().trim(),
  query('page').if(query('page').exists()).isInt(),
  handleResult,
  searchActivities,
]);
router.get(
  '/activity/detail/:id',
  param('id').not().isEmpty().trim(),
  handleResult,
  getActivityDetail,
);
router.get('/activity/types', getTypes);
router.get(
  '/activities/',
  query('page').if(query('page').exists()).isInt(),
  handleResult,
  getActivities,
);

export default router;
