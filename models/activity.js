import pool from './databasePool';

export async function createActivity(activityData, hostId, chatroomId, pictureFilename) {
  const {
    typeId,
    title,
    price,
    attendeesLimit,
    startFrom,
    endAt,
    dateline,
    description,
    longitude,
    latitude,
    locationName,
  } = activityData;

  const locationPoint = `POINT(${longitude} ${latitude})`;

  const { rows } = await pool.query(
    `
    INSERT INTO activity(host_id, type_id, chatroom_id, title, location, location_name, price, attendees_limit, start_from, end_at, dateline, description, picture)
    VALUES($1, $2, $3, $4, ST_GeomFromText($5, 4326), $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
    `,
    [
      hostId,
      typeId,
      chatroomId,
      title,
      locationPoint,
      locationName,
      price,
      attendeesLimit,
      startFrom,
      endAt,
      dateline,
      description,
      pictureFilename,
    ],
  );

  return rows[0];
}

export async function searchActivities(query) {
  const {
    title, typeId, startDate, endDate,
  } = query;

  let condition = `
    WHERE title LIKE $1
  `;
  const values = [`%${title || ''}%`];
  let params = 1;

  if (typeId) {
    params += 1;
    condition += ` AND type_id = $${params}`;
    values.push(typeId);
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
  JOIN activity_type ON activity.type_id = activity_type.id
  ${condition}
`;

  const { rows } = await pool.query(queryText, values);
  return rows;
}

export async function getActivityDetail(id) {
  const { rows } = await pool.query(
    `
    SELECT
      activity.id,
      activity.title,
      activity.price,
      activity.chatroom_id,
      activity.attendees_limit,
      activity.current_attendees_count,
      activity.start_from,
      activity.end_at,
      activity.dateline,
      activity.description,
      activity.create_at,
      activity.picture,
      activity.location_name,
      activity_type.name as type_name,
      ST_X(location::geometry) as longitude,
      ST_Y(location::geometry) as latitude,
      "user".id as host_id,
      "user".name as host_name,
      "user".email as host_email,
      "user".avatar as host_avatar
    FROM activity
    JOIN activity_type ON activity.type_id = activity_type.id
    JOIN "user" ON activity.host_id = "user".id
    WHERE activity.id = $1
  `,
    [id],
  );
  return rows[0];
}

export async function getTypes() {
  const { rows } = await pool.query(
    `
    SELECT * FROM activity_type
    `,
  );
  return rows;
}

export async function incrementAttendance(activityId, connection) {
  const { rowCount } = await connection.query(
    `
      UPDATE activity
      SET current_attendees_count = current_attendees_count + 1
      WHERE id = $1
      AND current_attendees_count + 1 <= attendees_limit
      `,
    [activityId],
  );

  return rowCount > 0;
}
