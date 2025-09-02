const express = require('express');
const router = express.Router();
const { signup, login, getAllUsers, getUserProfile } = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware'); // ✅ Import middleware


router.post('/signup', signup);
router.post('/login', login);
router.get('/users', verifyToken, getAllUsers); // 🔒 Protected with JWT
router.get('/profile', verifyToken, getUserProfile); // 🔒 Protected with JWT

// router.get('/users', getAllUsers);

module.exports = router;
