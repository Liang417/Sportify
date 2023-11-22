import * as chatroomModel from '../models/chatroom';

// eslint-disable-next-line import/prefer-default-export
export async function getChatroom(req, res, next) {
  try {
    const userId1 = res.locals.user.id;
    const userId2 = req.params.id;

    let chatroomId = await chatroomModel.getChatroom(userId1, userId2);

    if (chatroomId) {
      return res.json(Number(chatroomId));
    }

    chatroomId = await chatroomModel.createChatroom();

    await chatroomModel.createChatroomUser(chatroomId, userId1, userId2);
    return res.json(Number(chatroomId));
  } catch (err) {
    next(err);
  }
}
