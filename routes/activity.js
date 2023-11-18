import { Router } from 'express';
import { createActivity, getTypes, searchActivities } from '../controllers/activity';

const router = Router();

router.post('/activity', createActivity);
router.get('/activity/search', searchActivities);
router.get('/activity/types', getTypes);

export default router;
