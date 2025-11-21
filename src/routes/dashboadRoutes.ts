import express from 'express'
const router = express.Router()
import { authMiddleware } from '../middleware/authMiddleware'
import { requireRole } from '../middleware/roleMiddleware';
import { getUserDashboard, getAgentDashboard, getAdminDashboard } from '../controller/dashboardController';

// Excerpt: Role-specific protection
router.get('/user', authMiddleware, requireRole('user'), getUserDashboard as express.RequestHandler);
router.get('/agent', authMiddleware, requireRole('agent'), getAgentDashboard as express.RequestHandler);
router.get('/admin', authMiddleware, requireRole('admin'), getAdminDashboard as express.RequestHandler);

export default router;