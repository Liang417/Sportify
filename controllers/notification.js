import * as NotificationModel from '../models/notification';

export async function createNotification(req, res) {
  try {
    const notification = await NotificationModel.createNotification(req.body);
    res.status(201).json(notification);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getNotifications(req, res) {
  try {
    const notifications = await NotificationModel.getNotifications(
      res.locals.user.id,
    );
    res.status(200).json({ notifications });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
