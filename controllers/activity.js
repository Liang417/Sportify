/* eslint-disable no-underscore-dangle */
import * as activityModel from '../models/activity';
import * as activityUserModel from '../models/activity_user';
import * as chatroomModel from '../models/chatroom';
import * as commentModel from '../models/comment';
import * as notificationModel from '../models/notification';
import * as tagModel from '../models/tag';
import pool from '../models/databasePool';
import { getIO } from '../socket';

export async function createActivity(req, res) {
  try {
    const hostId = res.locals.user.id;
    const { picture } = req.files;
    const pictureFilename = picture[0].filename;
    const isPrivate = false;
    let { tags } = req.body;
    tags = JSON.parse(tags);

    const chatroomId = await chatroomModel.createChatroom(isPrivate, req.body.title);
    const newActivity = await activityModel.createActivity(
      req.body,
      hostId,
      chatroomId,
      pictureFilename,
    );

    await chatroomModel.createChatroomUser(chatroomId, [hostId]);
    await activityUserModel.insertUser(newActivity.id, hostId);

    const tagIds = await tagModel.getOrCreateTagIds(tags);
    await tagModel.createActivityTags(newActivity.id, tagIds);

    const elasticsearchData = {
      id: newActivity.id,
      title: newActivity.title,
      current_attendees_count: newActivity.current_attendees_count,
      start_from: newActivity.start_from,
      picture: newActivity.picture,
      location_name: newActivity.location_name,
      tags,
    };

    await fetch(`http://localhost:9200/activities/_doc/${newActivity.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(elasticsearchData),
    });

    res.status(200).json(newActivity);
  } catch (err) {
    res.status(500).json({ errors: err });
  }
}

export async function searchActivities(req, res) {
  try {
    const { query } = req.query;

    const response = await fetch('http://localhost:9200/activities/_search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: {
          multi_match: {
            query,
            fields: ['title', 'tags', 'location_name'],
          },
        },
      }),
    });

    const data = await response.json();
    const activities = data.hits.hits.map((hit) => hit._source);
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
    const { chatroomId, title } = req.body;
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

    const content = `您參與的活動「${title}」有新的使用者加入`;
    const notifications = await notificationModel.createNotification(
      attendeesIds,
      activityId,
      content,
      connection,
    );

    const isSuccess = await activityModel.incrementAttendance(activityId, connection);

    if (!isSuccess) {
      await connection.query('ROLLBACK');
      return res.status(400).json({ errors: '這個活動已達到人數上限' });
    }

    const io = getIO();
    notifications.forEach((notification) => {
      const roomName = `user-${notification.receiver_id}`;
      io.to(roomName).emit('getNotification', notification);
    });

    await connection.query('COMMIT');
    res.status(200).json({ message: '參加成功' });
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
    const { chatroomId, title } = req.body;

    await activityUserModel.deleteUser(activityId, userId);
    await chatroomModel.deleteChatroomUser(chatroomId, [userId]);
    await activityModel.decrementAttendance(activityId);
    const attendees = await activityUserModel.getActivityAttendees(activityId);
    const attendeesIds = attendees
      .filter((attendee) => attendee.user_id !== userId)
      .map((attendee) => attendee.user_id);

    const content = `您參與的活動「${title}」有使用者取消出席`;

    const notifications = await notificationModel.createNotification(
      attendeesIds,
      activityId,
      content,
    );
    const io = getIO();
    notifications.forEach((notification) => {
      const roomName = `user-${notification.receiver_id}`;
      io.to(roomName).emit('getNotification', notification);
    });

    res.status(200).json({ message: '取消成功' });
  } catch (err) {
    res.status(500).json({ errors: err });
  }
}

export async function deleteActivity(req, res) {
  try {
    const activityId = req.params.id;
    const userId = res.locals.user.id;

    const activityDetail = await activityModel.getActivityDetail(activityId);

    if (activityDetail.host_id !== userId) return res.status(401).json({ errors: '活動的主辦人才可以刪除活動' });

    const attendees = await activityUserModel.getActivityAttendees(activityId);
    const attendeesIds = attendees.map((attendee) => attendee.user_id);
    await activityUserModel.deleteUsers(activityId);
    await chatroomModel.deleteChatroomUsers(activityDetail.chatroom_id);
    await activityModel.deleteActivity(activityId);

    await fetch(`http://localhost:9200/activities/_doc/${activityId}`, {
      method: 'DELETE',
    });

    const content = `您參與的活動${activityDetail.title}已由主辦人刪除`;
    const notifications = await notificationModel.createNotification(
      attendeesIds,
      activityId,
      content,
    );
    const io = getIO();
    notifications.forEach((notification) => {
      const roomName = `user-${notification.receiver_id}`;
      io.to(roomName).emit('getNotification', notification);
    });

    res.status(200).json({ message: '活動刪除成功' });
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
