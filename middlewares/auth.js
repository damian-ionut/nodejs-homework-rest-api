const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('Authorization header missing');
      return res.status(401).json({ message: 'Not authorized' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Token missing');
      return res.status(401).json({ message: 'Not authorized' });
    }

    console.log('Token received:', token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    const user = await User.findById(decoded.id);
    console.log('User found:', user);

    if (!user || user.token !== token) {
      console.log('User not found or token mismatch');
      return res.status(401).json({ message: 'Not authorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log('Authorization error:', error);
    res.status(401).json({ message: 'Not authorized' });
  }
};

module.exports = authMiddleware;
