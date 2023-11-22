import pool from './databasePool';

export async function createActivity(activityData, host) {
  const {
    type,
    title,
    price,
    attendeesLimit,
    startFrom,
    endAt,
    dateline,
    note,
    longitude,
    latitude,
  } = activityData;

  const locationPoint = `POINT(${longitude} ${latitude})`;

  const { rows } = await pool.query(
    `
    INSERT INTO activity(host, type, title, location, price, attendees_limit, start_from, end_at, dateline, note)
    VALUES($1, $2, $3, ST_GeomFromText($4, 4326), $5, $6, $7, $8, $9, $10)
    RETURNING *
    `,
    [host, type, title, locationPoint, price, attendeesLimit, startFrom, endAt, dateline, note],
  );

  return rows;
}

export async function searchActivities(query) {
  const {
    title, type, startDate, endDate,
  } = query;

  let condition = `
    WHERE title LIKE $1
  `;
  const values = [`%${title || ''}%`];
  let params = 1;

  if (type) {
    params += 1;
    condition += ` AND type = $${params}`;
    values.push(type);
  }
  if (startDate) {
    params += 1;
    condition += ` AND start_from >= $${params}`;
    values.push(startDate);
  }
  if (endDate) {
    params += 1;
    condition += ` AND end_at <= $${params}`;
    values.push(endDate);
  }

  const queryText = `
  SELECT
    activity.*,
    activity_type.name as type_name,
    ST_X(location::geometry) as longitude,
    ST_Y(location::geometry) as latitude
  FROM activity
  JOIN activity_type ON activity.type = activity_type.id
  ${condition}
`;

  const { rows } = await pool.query(queryText, values);
  return rows;
}

export async function getTypes() {
  const { rows } = await pool.query(
    `
    SELECT * FROM activity_type
    `,
  );
  return rows;
}
