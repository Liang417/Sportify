import pool from './databasePool';

export async function insertUser(activityId, userId, connection) {
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

export default { insertUser };
