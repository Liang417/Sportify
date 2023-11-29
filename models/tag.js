import pool from './databasePool';

export async function getTags() {
  const { rows } = await pool.query('SELECT * FROM tag');
  return rows;
}

export async function createTag(name) {
  const { rows } = await pool.query(
    'INSERT INTO tag (name) VALUES ($1) RETURNING *',
    [name],
  );
  return rows[0];
}
