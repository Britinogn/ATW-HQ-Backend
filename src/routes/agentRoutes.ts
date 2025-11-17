import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import agentController from '../controller/agentController'; 

const router = Router();

// Submit agent application form (agents only, post-registration)
router.post('/apply', authMiddleware, requireRole('agent'), agentController.submitApplication);

// Get agent's own application status (agents only)
router.get('/my-application', authMiddleware, requireRole('agent'), agentController.getMyApplication);

// Get pending applications for review (admins only)
router.get('/applications/pending', authMiddleware, requireRole('admin'), agentController.getPendingApplications);

// Approve an application (admins only)
router.patch('/applications/:id/approve', authMiddleware, requireRole('admin'), agentController.approveApplication);

// Reject an application (admins only, with optional reason in body)
router.patch('/applications/:id/reject', authMiddleware, requireRole('admin'), agentController.rejectApplication);

export default router;