const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Joi = require('joi');

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    await userSchema.validateAsync({ email, password });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(201).json({ user: { email: user.email, subscription: user.subscription } });
  } catch (error) {
    res.status(400).json(error.details ? error.details[0] : { message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    await userSchema.validateAsync({ email, password });

    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Email or password is wrong' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.token = token;
    await user.save();
    console.log('User logged in successfully:', { email: user.email, token });

    res.status(200).json({ token, user: { email: user.email, subscription: user.subscription } });
  } catch (error) {
    res.status(400).json(error.details ? error.details[0] : { message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      console.log('User not found in request');
      return res.status(401).json({ message: 'Not authorized' });
    }

    console.log('User before logout:', user);
    user.token = null;
    await user.save();
    console.log('User after logout:', user);

    res.status(204).end();
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.current = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({ email: user.email, subscription: user.subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!['starter', 'pro', 'business'].includes(subscription)) {
      return res.status(400).json({ message: 'Invalid subscription type' });
    }

    req.user.subscription = subscription;
    await req.user.save();

    res.status(200).json({ email: req.user.email, subscription: req.user.subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};