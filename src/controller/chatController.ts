import { Request, Response } from 'express';
import { IUser } from '../types';
import ChatRoom from '../models/ChatRoom';
import Message from '../models/Message';
import { io } from '../server';  // Assume Socket.io instance from server.ts

// Create or get chat room between user and agent
export const createOrGetRoom = async (req: Request & { user?: IUser }, res: Response) => {
    try {
        const { targetId, targetRole } = req.body;  // e.g., { targetId: agentId, targetRole: 'agent' }
        const currentUserId = req.user?.id;

        if (!targetId || !targetRole || targetRole === req.user?.role) {
            return res.status(400).json({ status: false, message: 'Invalid target.' });
        }

        let room = await ChatRoom.findOne({
            $or: [
                { userId: currentUserId, agentId: targetId },
                { userId: targetId, agentId: currentUserId }
            ]
        });

        if (!room) {
            room = new ChatRoom({
                userId: req.user?.role === 'user' ? currentUserId : targetId,
                agentId: req.user?.role === 'agent' ? currentUserId : targetId
            });
            await room.save();
        }

        res.json({ status: true, data: { roomId: room._id, lastMessageAt: room.lastMessageAt } });
    } catch (error: any) {
        res.status(500).json({ status: false, message: error.message });
    }
};

// Send message
export const sendMessage = async (req: Request & { user?: IUser }, res: Response) => {
    try {
        const { roomId, content } = req.body;
        const senderId = req.user?.id;
        const senderRole = req.user?.role;

        if (!roomId || !content.trim()) {
            return res.status(400).json({ status: false, message: 'Room ID and content required.' });
        }

        const room = await ChatRoom.findById(roomId);
        if (!room || (room.userId.toString() !== senderId && room.agentId.toString() !== senderId)) {
            return res.status(403).json({ status: false, message: 'Access denied to room.' });
        }

        const message = new Message({
            roomId,
            senderId,
            senderRole,
            content: content.trim()
        });
        await message.save();

        // Update room last message
        room.lastMessageAt = new Date();
        room.unreadCount = {
            user: senderRole === 'agent' ? room.unreadCount.user + 1 : room.unreadCount.user,
            agent: senderRole === 'user' ? room.unreadCount.agent + 1 : room.unreadCount.agent
        };
        await room.save();

        // Real-time broadcast via Socket.io
        io.to(roomId.toString()).emit('newMessage', { message, senderRole });

        res.json({ status: true, data: message });
    } catch (error: any) {
        res.status(500).json({ status: false, message: error.message });
    }
};

// Get messages for a room
export const getMessages = async (req: Request<{ roomId: string }> & { user?: IUser }, res: Response) => {
    try {
        const { roomId } = req.params;
        const senderId = req.user?.id;

        const room = await ChatRoom.findById(roomId);
        if (!room || (room.userId.toString() !== senderId && room.agentId.toString() !== senderId)) {
            return res.status(403).json({ status: false, message: 'Access denied.' });
        }

        const messages = await Message.find({ roomId })
            .populate('senderId', 'name role')
            .sort({ createdAt: 1 })
            .limit(50);  // Paginate for performance

        // Mark as read for sender
        await Message.updateMany({ roomId, senderId: { $ne: senderId } }, { isRead: true });

        res.json({ status: true, data: messages });
    } catch (error: any) {
        res.status(500).json({ status: false, message: error.message });
    }
};

// Get user's chats
export const getUserChats = async (req: Request & { user?: IUser }, res: Response) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;

        const rooms = await ChatRoom.find(
            role === 'user' ? { userId } : { agentId: userId }
        ).populate(
            role === 'user' ? 'agentId' : 'userId',
            'name email profile'
        ).sort({ lastMessageAt: -1 });

        res.json({ status: true, data: rooms });
    } catch (error: any) {
        res.status(500).json({ status: false, message: error.message });
    }
};

// Admin: Get all chats (for moderation)
export const getAllChats = async (req: Request, res: Response) => {
    try {
        const rooms = await ChatRoom.find()
            .populate('userId', 'name email role')
            .populate('agentId', 'name email role')
            .sort({ lastMessageAt: -1 });

        const chatsWithMessages = await Promise.all(
            rooms.map(async (room) => ({
                room: room,
                recentMessages: await Message.find({ roomId: room._id })
                    .populate('senderId', 'name role')
                    .sort({ createdAt: -1 })
                    .limit(5)
            }))
        );

        res.json({ status: true, data: chatsWithMessages });
    } catch (error: any) {
        res.status(500).json({ status: false, message: error.message });
    }
};

export default {
    createOrGetRoom,
    sendMessage,
    getMessages,
    getUserChats,
    getAllChats
};