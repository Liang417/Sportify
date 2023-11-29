import pool from './databasePool';

export async function getChatroom(userId1, userId2, isPrivate = false) {
  const { rows } = await pool.query(
    `
    SELECT c.id as chatroom_id
    FROM chatroom_user cu
    JOIN chatroom c ON cu.chatroom_id = c.id
    WHERE c.is_private = $3
    AND cu.user_id IN ($1, $2)
    GROUP BY c.id
    HAVING COUNT(DISTINCT cu.user_id) = 2;
    `,
    [userId1, userId2, isPrivate],
  );
  return rows.length > 0 ? rows[0].chatroom_id : null;
}

export async function getChatroomIds(userId, isPrivate) {
  const { rows } = await pool.query(
    `
    SELECT chatroom.id as id
    FROM chatroom_user
    JOIN chatroom ON chatroom_user.chatroom_id = chatroom.id
    WHERE chatroom.is_private = $2
    AND chatroom_user.user_id = $1
    `,
    [userId, isPrivate],
  );
  return rows;
}

export async function getChatrooms(userId, chatroomIds) {
  const { rows } = await pool.query(
    `
    SELECT 
      chatroom_id as id,
      user_id,
      name,
      avatar
    FROM chatroom_user
    JOIN "user" ON chatroom_user.user_id = "user".id
    WHERE chatroom_user.chatroom_id = ANY($2)
    AND chatroom_user.user_id != $1
    `,
    [userId, chatroomIds],
  );
  return rows;
}

export async function createChatroom(isPrivate) {
  const { rows } = await pool.query(
    `
    INSERT INTO chatroom(is_private) values(${isPrivate}) RETURNING id;
    `,
  );
  return rows[0].id;
}

export async function createChatroomUser(
  chatroomId,
  userIds,
  connection = pool,
) {
  const values = userIds
    .map((userId, index) => `($1, $${index + 2})`)
    .join(', ');
  const query = `
  INSERT INTO "chatroom_user" (chatroom_id, user_id)
  VALUES ${values}
  RETURNING *
`;
  const { rows } = await connection.query(query, [chatroomId, ...userIds]);

  return rows;
}
