import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
  try {
    const { jwtToken } = req.cookies;

    if (!jwtToken) {
      return res.status(401).json({ message: 'Authentication failed: Please Login First' });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    res.locals.user = decoded.user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res
        .status(403)
        .json({ message: 'Authentication failed: Your token has been expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Authentication failed: Invalid token' });
    }
    next(err);
  }
};

export default userAuth;
