const express = require('express');
const router = express.Router();
const { signup, login, updateTheme, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.patch('/theme', verifyToken, updateTheme);

module.exports = router;