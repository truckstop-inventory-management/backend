import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register User
export const registerUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const user = await User.create({ username, password });
    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};