import pool from './databasePool';

export async function createMessage(chatroomId, senderId, content, isGroupMessage = false) {
  await pool.query(
    `
  INSERT INTO message (chatroom_id, sender_id, content, is_group_message) 
  VALUES ($1, $2, $3, $4)
  `,
    [chatroomId, senderId, content, isGroupMessage],
  );
}

export async function getMessages(chatroomId) {
  const { rows } = await pool.query(
    `
    SELECT * FROM message
    WHERE chatroom_id = $1
    `,
    [chatroomId],
  );
  return rows;
}
