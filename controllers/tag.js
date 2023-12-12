import * as tagModel from '../models/tag';

export async function getTags(req, res, next) {
  try {
    const tags = await tagModel.getTags();
    res.json({ tags });
  } catch (err) {
    next(err);
  }
}

export default { getTags };
