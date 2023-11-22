import * as activityModel from '../models/activity';

export async function createActivity(req, res) {
  try {
    const host = 1; // fake userId
    const newActivity = await activityModel.createActivity(req.body, host);
    res.status(200).json(newActivity);
  } catch (err) {
    res.status(500).json({ errors: err });
  }
}

export async function searchActivities(req, res) {
  try {
    const activities = await activityModel.searchActivities(req.query);
    res.status(200).json(activities);
  } catch (err) {
    res.status(500).json({ errors: err });
  }
}

export async function getTypes(req, res) {
  try {
    const types = await activityModel.getTypes();
    res.status(200).json(types);
  } catch (err) {
    res.status(500).json({ errors: err });
  }
}
