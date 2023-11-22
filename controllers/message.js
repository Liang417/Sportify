import * as messageModel from '../models/message';

export async function createMessage(req, res, next) {
  try {
    const senderId = res.locals.user.id;
    const { chatroomId, content, isGroupMessage } = req.body;

    await messageModel.createMessage(chatroomId, senderId, content, isGroupMessage);
    res.status(201).json({ message: 'Message created successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getMessages(req, res, next) {
  try {
    const { chatroomId } = req.params;
    const messages = await messageModel.getMessages(chatroomId);
    res.status(200).json(messages);
  } catch (err) {
    next(err);
  }
}
