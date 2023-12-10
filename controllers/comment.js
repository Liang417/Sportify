import { getActivityAttendees } from '../models/activity_user';
import * as commentModel from '../models/comment';
import { createNotification } from '../models/notification';

export async function getComments(req, res, next) {
  try {
    const { activityId } = req.params;
    const comments = await commentModel.getComments(activityId);
    res.status(200).json({ comments });
  } catch (err) {
    next(err);
  }
}

export async function createComment(req, res, next) {
  try {
    const userId = res.locals.user.id;
    const { activityId } = req.params;
    const { content } = req.body;

    const attendees = await getActivityAttendees(activityId);
    const attendeesIds = attendees
      .map((attendee) => (attendee.user_id !== userId ? attendee.user_id : null))
      .filter((id) => id !== null);

    if (attendeesIds.length > 0) {
      const notificationContent = `New comment from ${res.locals.user.name} on your activity`;
      await createNotification(attendeesIds, activityId, notificationContent);
    }

    const comment = await commentModel.createComment(activityId, userId, content);
    return res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
}
