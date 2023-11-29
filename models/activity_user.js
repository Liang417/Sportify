import pool from './databasePool';

export async function insertUser(activityId, userId, connection = pool) {
  const { rows } = await connection.query(
    `
    INSERT INTO activity_user (activity_id, user_id)
    VALUES ($1, $2)
    RETURNING *
    `,
    [activityId, userId],
  );
  return rows[0];
}

export async function getUser(activityId, userId) {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM activity_user
    WHERE activity_id = $1 AND user_id = $2
    `,
    [activityId, userId],
  );
  return rows[0];
}

export async function getActivityAttendees(activityId) {
  const { rows } = await pool.query(
    `
    SELECT
      "user".id as user_id,
      "user".name,
      "user".email,
      "user".avatar
    FROM activity_user
    JOIN "user" ON "activity_user".user_id = "user".id
    WHERE activity_id = $1
  `,
    [activityId],
  );
  return rows;
}

export async function getUserActivities(userId) {
  const { rows } = await pool.query(
    `
    SELECT activity_id FROM activity_user
    WHERE user_id = $1
  `,
    [userId],
  );
  return rows;
}
