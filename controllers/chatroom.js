import * as chatroomModel from '../models/chatroom';

export async function createChatroom(req, res, next) {
  try {
    const userId1 = res.locals.user.id;
    const userId2 = req.body.userId;

    const isPrivate = true;
    let chatroomId = await chatroomModel.getChatroom(userId1, userId2, isPrivate);

    if (chatroomId) {
      return res.json(chatroomId);
    }

    chatroomId = await chatroomModel.createChatroom(isPrivate);
    await chatroomModel.createChatroomUser(chatroomId, [userId1, userId2]);

    return res.json({ chatroomId });
  } catch (err) {
    next(err);
  }
}

export async function getPrivateChatrooms(req, res, next) {
  try {
    const isPrivate = true;
    const userId = res.locals.user.id;

    let chatroomIds = await chatroomModel.getChatroomIds(userId, isPrivate);
    chatroomIds = chatroomIds.map((chatroom) => chatroom.id);
    const privateChatrooms = await chatroomModel.getChatrooms(userId, chatroomIds);

    return res.json({ privateChatrooms });
  } catch (err) {
    next(err);
  }
}

export async function getGroupChatrooms(req, res, next) {
  try {
    const isPrivate = false;
    const userId = res.locals.user.id;

    const groupChatrooms = await chatroomModel.getChatroomIds(userId, isPrivate);

    return res.json({ groupChatrooms });
  } catch (err) {
    next(err);
  }
}
