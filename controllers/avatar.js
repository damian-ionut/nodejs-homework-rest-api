const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
const User = require('../models/user');

const tmpDir = path.join(__dirname, '../tmp');
const avatarsDir = path.join(__dirname, '../public/avatars');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

exports.uploadAvatar = [upload.single('avatar'), async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const filePath = path.join(tmpDir, req.file.filename);
    const image = await Jimp.read(filePath);
    await image.resize(250, 250).writeAsync(filePath);

    const avatarURL = `/avatars/${req.file.filename}`;
    fs.renameSync(filePath, path.join(avatarsDir, req.file.filename));

    user.avatarURL = avatarURL;
    await user.save();

    res.status(200).json({ avatarURL });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}];
