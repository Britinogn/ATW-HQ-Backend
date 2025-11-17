import mongoose, { Schema, model, Document } from 'mongoose';
import type { IAgentApplication } from '../types'; // Adjust path for IAgentApplication interface
import { AgentApplicationStatus } from '../types/enums'; // Adjust for AgentApplicationStatus enum

const agentApplicationSchema = new Schema<IAgentApplication & Document>({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, 'User ID is required'],
        unique: true  // One application per user
    },
    fullName: { 
        type: String, 
        required: [true, 'Full name is required'], 
        trim: true, 
        maxlength: [100, 'Full name cannot exceed 100 characters'] 
    },
    phone: { 
        type: String, 
        required: [true, 'Phone number is required'], 
        match: [/^\+?[\d\s-]{10,}$/, 'Please use a valid phone number'] 
    },
    businessName: { 
        type: String, 
        trim: true, 
        maxlength: [100, 'Business name cannot exceed 100 characters'] 
    },
    experienceYears: { 
        type: Number, 
        required: [true, 'Experience years is required'], 
        min: [0, 'Experience years cannot be negative'] 
    },
    licenseNumber: { 
        type: String, 
        trim: true, 
        maxlength: [50, 'License number cannot exceed 50 characters'] 
    },
    bio: { 
        type: String, 
        required: [true, 'Bio is required'], 
        trim: true, 
        maxlength: [1000, 'Bio cannot exceed 1000 characters'] 
    },
    documents: [{ 
        type: String, 
        required: true  // URLs of uploaded documents
    }],
    status: { 
        type: String, 
        enum: Object.values(AgentApplicationStatus), 
        default: AgentApplicationStatus.PENDING 
    },
    appliedAt: { 
        type: Date, 
        default: Date.now 
    },
    reviewedAt: { 
        type: Date 
    },
    reviewedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'  // Admin who reviewed
    },
    rejectionReason: { 
        type: String, 
        maxlength: [500, 'Rejection reason cannot exceed 500 characters'] 
    }
}, { 
    timestamps: true  // Auto-handles createdAt and updatedAt
});

// Indexes for efficient queries
agentApplicationSchema.index({ userId: 1 });
agentApplicationSchema.index({ status: 1 });
agentApplicationSchema.index({ reviewedBy: 1, reviewedAt: 1 });

// Compile and export the model
const AgentApplication = model<IAgentApplication & Document>('AgentApplication', agentApplicationSchema);

export default AgentApplication;