const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const Jimp = require('jimp');
const User = require('../models/user');
const Joi = require('joi');
const path = require('path');
const fs = require('fs');

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
    const avatarURL = gravatar.url(email, { s: '250', r: 'x', d: 'retro' });
    const user = new User({ email, password: hashedPassword, avatarURL });
    await user.save();

    res.status(201).json({ user: { email: user.email, subscription: user.subscription, avatarURL: user.avatarURL } });
  } catch (error) {
    res.status(400).json(error.details ? error.details[0] : { message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token, user: { email: user.email, subscription: user.subscription, avatarURL: user.avatarURL } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const avatarPath = path.join('tmp', file.filename);
    const processedAvatar = await Jimp.read(avatarPath);
    await processedAvatar.resize(250, 250).writeAsync(avatarPath);

    const newAvatarName = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
    const newAvatarPath = path.join('public/avatars', newAvatarName);
    fs.renameSync(avatarPath, newAvatarPath);

    const avatarURL = `/avatars/${newAvatarName}`;
    req.user.avatarURL = avatarURL;
    await req.user.save();

    res.status(200).json({ avatarURL });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
