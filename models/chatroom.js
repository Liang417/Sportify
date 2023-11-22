import pool from './databasePool';

export async function getChatroom(userId1, userId2) {
  const { rows } = await pool.query(
    `
    SELECT chatroom_id
    FROM chatroom_user
    WHERE user_id IN ($1, $2)
    GROUP BY chatroom_id
    HAVING COUNT(DISTINCT user_id) = 2;    
    `,
    [userId1, userId2],
  );
  if (rows.length > 0) {
    return rows[0].chatroom_id;
  }
  return rows[0];
}

export async function createChatroom() {
  const { rows } = await pool.query(
    `
    INSERT INTO "chatroom" DEFAULT VALUES RETURNING id;
    `,
  );
  return rows[0].id;
}

export async function createChatroomUser(chatroomId, userId1, userId2) {
  const { rows } = await pool.query(
    `
    INSERT INTO "chatroom_user" (chatroom_id, user_id) VALUES ($1, $2), ($1, $3) RETURNING *
    `,
    [chatroomId, userId1, userId2],
  );
  return rows;
}
