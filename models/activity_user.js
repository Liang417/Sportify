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

export async function deleteUser(activityId, userId) {
  const { rows } = await pool.query(
    `
    DELETE FROM activity_user
    WHERE activity_id = $1 AND user_id = $2
    RETURNING *
    `,
    [activityId, userId],
  );
  return rows[0];
}

export async function deleteUsers(activityId) {
  const { rows } = await pool.query(
    `
    DELETE FROM activity_user
    WHERE activity_id = $1
    RETURNING *
    `,
    [activityId],
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
    condition = 'user_id = $1 AND start_from > $2';
  } else if (query.option === 'hosting') {
    condition = 'host_id = $1 AND start_from > $2';
  } else if (query.option === 'past') {
    condition = 'user_id = $1 AND start_from < $2';
  }

  const { rows } = await pool.query(
    `
    SELECT 
      activity.*,
      array_agg(tag.name) as tags
    FROM activity_user
    JOIN activity ON activity_user.activity_id = activity.id
    JOIN activity_tag ON activity.id = activity_tag.activity_id
    JOIN tag ON activity_tag.tag_id = tag.id
    WHERE ${condition}
    GROUP BY activity.id
    ORDER BY start_from ASC
  `,
    queryParams,
  );
  return rows;
}
