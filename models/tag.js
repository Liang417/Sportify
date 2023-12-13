import pool from './databasePool';

export async function getTags() {
  const { rows } = await pool.query('SELECT * FROM tag');
  return rows;
}

async function getTagIds(tagNames) {
  const query = `SELECT id FROM tag WHERE name IN (${tagNames
    .map((name) => `'${name}'`)
    .join(', ')})`;
  const { rows } = await pool.query(query);
  const result = rows.map((row) => row.id);
  return result;
}

async function createTags(tagNames) {
  if (tagNames.length === 0) {
    return [];
  }

  const values = tagNames.map((name) => `('${name}')`).join(', ');
  const query = `
      INSERT INTO tag (name)
      VALUES ${values}
      ON CONFLICT DO NOTHING
      RETURNING id
    `;
  const { rows } = await pool.query(query);
  const result = rows.map((row) => row.id);
  return result;
}

export async function getOrCreateTagIds(tagNames) {
  const existingTagIds = await getTagIds(tagNames);
  const newTagIds = await createTags(tagNames);
  return [...existingTagIds, ...newTagIds];
}

export async function createActivityTags(activityId, tagIds) {
  const values = tagIds.map((id) => `(${activityId}, ${id})`).join(', ');
  const query = `
      INSERT INTO activity_tag (activity_id, tag_id)
      VALUES ${values}
      ON CONFLICT DO NOTHING
      RETURNING *
    `;
  const { rows } = await pool.query(query);
  return rows;
}

export async function deleteActivityTags(activityId) {
  const query = `DELETE FROM activity_tag WHERE activity_id = ${activityId}`;
  await pool.query(query);
}
