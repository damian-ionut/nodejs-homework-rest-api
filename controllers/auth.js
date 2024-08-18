const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const User = require('../models/user');
const sendEmail = require('../helpers/sendEmail');
const fs = require('fs');
const path = require('path');

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
    const userId = uuidv4();
    const avatarDir = path.join(__dirname, '../public/avatars', userId);
    const originalAvatarPath = path.join(__dirname, '../public/avatar.jpg');
    const newAvatarPath = path.join(avatarDir, 'avatar.jpg');

    fs.mkdirSync(avatarDir, { recursive: true });
    fs.copyFileSync(originalAvatarPath, newAvatarPath);

    const avatarURL = `${req.protocol}://${req.get('host')}/avatars/${userId}/avatar.jpg`;
    const verificationToken = uuidv4();

    const user = new User({ email, password: hashedPassword, avatarURL, verificationToken });
    await user.save();

    const verificationLink = `${req.protocol}://${req.get('host')}/auth/verify/${verificationToken}`;
    await sendEmail(email, 'Please verify your email', `<a href="${verificationLink}">Verify your email</a>`);

    res.status(201).json({ message: 'Signup successful! Please check your email to verify your account.' });
  } catch (error) {
    res.status(400).json(error.details ? error.details[0] : { message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.verify = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: 'Verification successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Missing required field email' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verify) {
      return res.status(400).json({ message: 'Verification has already been passed' });
    }

    const verificationLink = `${req.protocol}://${req.get('host')}/auth/verify/${user.verificationToken}`;
    await sendEmail(email, 'Please verify your email', `<a href="${verificationLink}">Verify your email</a>`);

    res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAvatar = async (req, res) => {
};

exports.login = async (req, res) => {
};