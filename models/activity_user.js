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

export async function getUserActivities(userId, query) {
  let condition = '';
  const queryParams = [userId, new Date()];

  if (query.option === 'attending') {
    condition = 'WHERE user_id = $1 AND start_from > $2 ORDER BY start_from ASC';
  }

  if (query.option === 'hosting') {
    condition = 'WHERE host_id = $1 AND start_from > $2 ORDER BY start_from ASC';
  }

  if (query.option === 'past') {
    condition = 'WHERE user_id = $1 AND start_from < $2 ORDER BY start_from ASC';
  }

  const { rows } = await pool.query(
    `
    SELECT * FROM activity_user
    JOIN activity ON activity_user.activity_id = activity.id
    ${condition}
  `,
    queryParams,
  );
  return rows;
}
