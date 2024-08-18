const express = require('express');
const router = express.Router();
const { signup, login, updateAvatar, verifyEmail, resendVerificationEmail } = require('../controllers/auth');
const multer = require('multer');
const path = require('path');

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'tmp'); 
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: avatarStorage });

router.post('/signup', signup);
router.post('/login', login); 
router.patch('/avatar', upload.single('avatar'), updateAvatar);
router.get('/verify/:verificationToken', verifyEmail); 
router.post('/verify', resendVerificationEmail);

module.exports = router;
