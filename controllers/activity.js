/* eslint-disable no-unused-vars */
import * as activityModel from '../models/activity';
import * as activityUserModel from '../models/activity_user';
import pool from '../models/databasePool';

export async function createActivity(req, res) {
  try {
    const hostId = res.locals.user.id;
    const { picture } = req.files;
    const pictureFilename = picture[0].filename;

    const newActivity = await activityModel.createActivity(req.body, hostId, pictureFilename);
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
    const user = await activityUserModel.getUser(activityId, userId);

    if (user) {
      return res.status(400).json({ errors: 'User already attended this activity' });
    }

    await activityUserModel.insertUser(activityId, userId, connection);
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
