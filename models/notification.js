import pool from './databasePool';

export async function createNotification(
  receiverIds,
  activityId,
  content,
  connection = pool,
) {
  const values = receiverIds
    .map((id, index) => `($1, $2, $${index + 3})`)
    .join(',');
  const query = `INSERT INTO notification (content, activity_id, receiver_id) VALUES ${values}`;
  await connection.query(query, [content, activityId, ...receiverIds]);
}

export async function getNotifications(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM notification WHERE receiver_id = $1',
    [userId],
  );
  return rows;
}