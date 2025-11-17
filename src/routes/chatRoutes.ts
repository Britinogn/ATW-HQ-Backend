import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import chatController from '../controller/chatController';

const router = Router();

// Create or get chat room (authenticated users/agents)
router.post('/room', authMiddleware, chatController.createOrGetRoom);

// Send message (authenticated users/agents)
router.post('/message', authMiddleware, chatController.sendMessage);

// Get messages for a room (authenticated users/agents; admins see all)
router.get('/room/:roomId/messages', authMiddleware, chatController.getMessages);

// Get all chats for user/agent (authenticated)
router.get('/my-chats', authMiddleware, chatController.getUserChats);

// Admin: Get all chats (admins only)
router.get('/admin/chats', authMiddleware, requireRole('admin'), chatController.getAllChats);

export default router;