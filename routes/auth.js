const express = require('express');
const { getRegister, postRegister, getLogin, postLogin, getProfile, logout } = require('../controller/authController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/register', getRegister);
router.post('/register', postRegister);
router.get('/login', getLogin);
router.post('/login',postLogin);
router.get('/profile', authMiddleware, getProfile);
router.post('/logout', logout)

module.exports = router;