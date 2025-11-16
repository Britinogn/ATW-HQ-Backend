import express from 'express';
const router = express.Router();

import authController from '../controller/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgetPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.get("/verify/:token", authController.verifyEmail);

// Protected routes
router.get('/profile', authMiddleware, requireRole(['user', 'admin', 'agent']), authController.profile);

export default router;