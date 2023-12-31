import { validationResult } from 'express-validator';

function handleResult(req, res, next) {
  const errorFormatter = ({ location, msg, path }) => `${location}[${path}]: ${msg}`;
  const result = validationResult(req).formatWith(errorFormatter);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array() });
  }
  next();
}

export default handleResult;
