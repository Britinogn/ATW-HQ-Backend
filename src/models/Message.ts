import mongoose, { Schema, model, Document } from 'mongoose';

export interface IMessage extends Document {
    roomId: mongoose.Types.ObjectId;  // Reference to ChatRoom
    senderId: mongoose.Types.ObjectId;  // User or agent
    senderRole: 'user' | 'agent';  // For quick filtering
    content: string;  // Message text
    isRead?: boolean;  // For unread tracking
    createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
    roomId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ChatRoom', 
        required: true 
    },
    senderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    senderRole: { 
        type: String, 
        enum: ['user', 'agent'], 
        required: true 
    },
    content: { 
        type: String, 
        required: true, 
        trim: true 
    },
    isRead: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

// Indexes for timeline queries
messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });

const Message = model<IMessage>('Message', messageSchema);

export default Message;