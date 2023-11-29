import pool from './databasePool';

export async function getComments(activityId) {
  const query = `
  SELECT 
    "comment".user_id,
    "user".name,
    "user".avatar,
    content,
    comment_at 
  FROM comment
  JOIN "user" ON comment.user_id = "user".id
  WHERE activity_id = $1
  `;
  const values = [activityId];
  const { rows } = await pool.query(query, values);
  return rows;
}

export async function createComment(activityId, userId, content) {
  const query = 'INSERT INTO comment (activity_id, user_id, content) VALUES ($1, $2, $3) RETURNING *';
  const values = [activityId, userId, content];
  const { rows } = await pool.query(query, values);
  return rows[0];
}
