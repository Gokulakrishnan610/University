import express from 'express';
import {
  register,
  login,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  resendVerification,
  getCurrentUser,
  logout
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/verify/:token', verifyEmail);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);
router.post('/resend-verification', resendVerification);
router.post('/logout', logout);

// Get current user using cookie
router.get('/current-user', getCurrentUser);

// Protected route example (just to test authentication)
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    message: 'Authentication successful',
    user: req.user,
  });
});

export default router; 