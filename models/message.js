import pool from './databasePool';

export async function createMessage(chatroomId, senderId, content) {
  await pool.query(
    `
  INSERT INTO message (chatroom_id, sender_id, content) 
  VALUES ($1, $2, $3)
  `,
    [chatroomId, senderId, content],
  );
}

export async function getMessages(chatroomId) {
  const { rows } = await pool.query(
    `
    SELECT 
      message.id,
      chatroom_id as chatroom_id,
      sender_id as sender_id,
      content,
      name as sender_name,
      avatar as sender_avatar,
      send_at
    FROM message
    JOIN "user" ON message.sender_id = "user".id
    WHERE chatroom_id = $1
    ORDER BY send_at
    `,
    [chatroomId],
  );
  return rows;
}
