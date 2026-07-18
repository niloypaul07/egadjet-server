const express = require('express');
const {
  registerValidators,
  loginValidators,
  validate,
  register,
  login,
  googleLogin,
  logout,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerValidators, validate, register);
router.post('/login', loginValidators, validate, login);
router.post('/google', googleLogin);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
