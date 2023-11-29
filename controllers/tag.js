import * as tagModel from '../models/tag';

export async function getTags(req, res, next) {
  try {
    const tags = await tagModel.getTags();
    res.json({ tags });
  } catch (err) {
    next(err);
  }
}

export async function createTag(req, res, next) {
  try {
    const tag = await tagModel.createTag(req.body);
    res.json({ tag });
  } catch (err) {
    next(err);
  }
}
