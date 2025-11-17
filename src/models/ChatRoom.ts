import mongoose, { Schema, model, Document } from 'mongoose';

export interface IChatRoom extends Document {
    userId: mongoose.Types.ObjectId; 
    agentId: mongoose.Types.ObjectId;  
    lastMessageAt: Date;
    unreadCount: { user: number; agent: number };  // For notifications
    createdAt: Date;
    updatedAt: Date;
}

const chatRoomSchema = new Schema<IChatRoom>({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    agentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    lastMessageAt: { 
        type: Date, 
        default: Date.now 
    },
    unreadCount: {
        user: { type: Number, default: 0 },
        agent: { type: Number, default: 0 }
    }
}, { timestamps: true });

// Indexes for quick lookups
chatRoomSchema.index({ userId: 1, agentId: 1 });
chatRoomSchema.index({ agentId: 1 });

const ChatRoom = model<IChatRoom>('ChatRoom', chatRoomSchema);

export default ChatRoom;