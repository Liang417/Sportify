import * as NotificationModel from '../models/notification';

export async function getNotifications(req, res) {
  try {
    const notifications = await NotificationModel.getNotifications(res.locals.user.id);
    res.status(200).json({ notifications });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

export default { getNotifications };
