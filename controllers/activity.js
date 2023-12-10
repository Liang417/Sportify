import * as activityModel from '../models/activity';
import * as activityUserModel from '../models/activity_user';
import * as chatroomModel from '../models/chatroom';
import * as commentModel from '../models/comment';
import * as notificationModel from '../models/notification';
import pool from '../models/databasePool';

export async function createActivity(req, res) {
  try {
    const hostId = res.locals.user.id;
    const { picture } = req.files;
    const pictureFilename = picture[0].filename;
    const isPrivate = false;

    const chatroomId = await chatroomModel.createChatroom(isPrivate, req.body.title);
    const newActivity = await activityModel.createActivity(
      req.body,
      hostId,
      chatroomId,
      pictureFilename,
    );

    await chatroomModel.createChatroomUser(chatroomId, [hostId]);
    await activityUserModel.insertUser(newActivity.id, hostId);

    res.status(200).json(newActivity);
  } catch (err) {
    res.status(500).json({ errors: err });
  }
}

export async function searchActivities(req, res) {
  try {
    const activities = await activityModel.searchActivities(req.query);
    res.status(200).json(activities);
  } catch (err) {
    res.status(500).json({ errors: err });
  }
}

export async function getActivityDetail(req, res) {
  try {
    const { id } = req.params;
    const activityDetail = await activityModel.getActivityDetail(id);
    if (!activityDetail) return res.status(404).json({ errors: 'Activity not found' });

    activityDetail.attendees = await activityUserModel.getActivityAttendees(id);
    activityDetail.comments = await commentModel.getComments(id);

    res.status(200).json(activityDetail);
  } catch (err) {
    res.status(500).json({ errors: err });
  }
}

export async function getTypes(req, res) {
  try {
    const types = await activityModel.getTypes();
    res.status(200).json(types);
  } catch (err) {
    res.status(500).json({ errors: err });
  }
}

export async function attendActivity(req, res) {
  const connection = await pool.connect();
  try {
    await connection.query('BEGIN');
    const activityId = req.params.id;
    const userId = res.locals.user.id;
    const { chatroomId } = req.body;
    const user = await activityUserModel.getUser(activityId, userId);

    if (user) {
      return res.status(400).json({ errors: 'You already attended this activity' });
    }

    await activityUserModel.insertUser(activityId, userId, connection);

    await chatroomModel.createChatroomUser(chatroomId, [userId], connection);

    const attendees = await activityUserModel.getActivityAttendees(activityId);

    const attendeesIds = attendees
      .filter((attendee) => attendee.user_id !== userId)
      .map((attendee) => attendee.user_id);

    const content = `New attendee ${res.locals.user.name} join your activity`;
    await notificationModel.createNotification(attendeesIds, activityId, content, connection);

    const isSuccess = await activityModel.incrementAttendance(activityId, connection);

    if (!isSuccess) {
      await connection.query('ROLLBACK');
      return res.status(400).json({ errors: 'This activity has reached the attendees limit' });
    }

    await connection.query('COMMIT');
    res.status(200).json({ message: 'Attended activity successfully' });
  } catch (err) {
    await connection.query('ROLLBACK');
    res.status(500).json({ errors: err });
  } finally {
    connection.release();
  }
}

export async function cancelAttendActivity(req, res) {
  try {
    const activityId = req.params.id;
    const userId = res.locals.user.id;
    const { chatroomId } = req.body;

    await activityUserModel.deleteUser(activityId, userId);
    await chatroomModel.deleteChatroomUser(chatroomId, [userId]);
    await activityModel.decrementAttendance(activityId);
    const attendees = await activityUserModel.getActivityAttendees(activityId);
    const attendeesIds = attendees
      .filter((attendee) => attendee.user_id !== userId)
      .map((attendee) => attendee.user_id);

    const content = `${res.locals.user.name} 取消參加活動`;

    await notificationModel.createNotification(attendeesIds, activityId, content);

    res.status(200).json({ message: 'Cancelled attendance successfully' });
  } catch (err) {
    res.status(500).json({ errors: err });
  }
}

export async function deleteActivity(req, res) {
  try {
    const activityId = req.params.id;
    const userId = res.locals.user.id;

    const activityDetail = await activityModel.getActivityDetail(activityId);

    if (activityDetail.host_id !== userId) return res.status(401).json({ errors: 'You are not the host of this activity' });

    const attendees = await activityUserModel.getActivityAttendees(activityId);
    const attendeesIds = attendees.map((attendee) => attendee.user_id);
    await activityUserModel.deleteUsers(activityId);
    await chatroomModel.deleteChatroomUsers(activityDetail.chatroom_id);
    await activityModel.deleteActivity(activityId);

    const content = `您參與的活動${activityDetail.title}已由主辦人刪除`;
    await notificationModel.createNotification(attendeesIds, activityId, content);

    res.status(200).json({ message: 'Cancelled attendance successfully' });
  } catch (err) {
    res.status(500).json({ errors: err });
  }
}

export async function getActivities(req, res) {
  try {
    const activities = await activityModel.getActivities(req.query);
    res.status(200).json(activities);
  } catch (err) {
    res.status(500).json({ errors: err });
  }
}
