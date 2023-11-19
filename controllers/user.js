import jwt from 'jsonwebtoken';
import validator from 'validator';
import * as userModel from '../models/user';

export async function signUp(req, res, next) {
  try {
    const { email, name, password } = req.body;
    const { avatar } = req.files;
    const avatarUrl = avatar[0].filename;

    if (!name || !email || !password || !avatarUrl[0]) {
      return res.status(400).json({ message: 'Name, email, password, and avatar are required.' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    if (await userModel.findByEmail(email)) {
      return res.status(403).json({
        message: 'This email has been registered.',
      });
    }

    const hashedPassword = await Bun.password.hash(password);
    const user = await userModel.create(name, email, hashedPassword, avatarUrl);
    const token = jwt.sign({ user }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE * 1000,
    });

    res.cookie('jwtToken', token, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: 'strict',
    });

    return res.status(200).json({
      data: {
        token,
        user,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function signIn(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!validator.isEmail(email) || !password) {
      return res.status(403).json({ message: 'Wrong email or password format.' });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(403).json({ message: 'Wrong email or password.' });
    }

    const isMatch = await Bun.password.verify(password, user.password);
    if (!isMatch) {
      return res.status(403).json({ message: 'Wrong email or password.' });
    }

    delete user.password;

    const token = jwt.sign({ user }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE * 1000,
    });

    res.cookie('jwtToken', token, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: 'strict',
    });

    return res.status(200).json({
      data: {
        token,
        user,
      },
    });
  } catch (err) {
    next(err);
  }
}
