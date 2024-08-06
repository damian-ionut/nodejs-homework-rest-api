const express = require('express');
const { signup, login, logout, current, updateSubscription } = require('../controllers/auth');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', authMiddleware, logout);
router.get('/current', authMiddleware, current);
router.patch('/', authMiddleware, updateSubscription);

module.exports = router;
