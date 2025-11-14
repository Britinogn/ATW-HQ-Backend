import express from 'express';
import paymentController from '../controller/paymentController';
import {authMiddleware} from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = express.Router();

// Public routes
router.post('/initialize', paymentController.initializePayment);
router.get('/verify/:reference', paymentController.verifyPayment);

// Protected route (admin-only)
router.get('/transactions', authMiddleware, requireRole('admin'), paymentController.listTransactions);

export default router;