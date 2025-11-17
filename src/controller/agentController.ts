import { Request, Response, NextFunction } from 'express';
import { IUser } from '../types';
import User from '../models/Users'; 
import AgentApplication from '../models/Agents'; 
import { sendEmail } from '../utils/emailService';

import { AgentApplicationStatus } from '../types/enums'; 

// Environment variable for admin email
const EMAIL_USER = process.env.EMAIL_USER!;

// Middleware to check if agent has already applied (for POST /apply)
export const checkApplicationStatus = async (req: Request & { user?: IUser }, res: Response, next: NextFunction) => {
    try {
        const application = await AgentApplication.findOne({ userId: req.user?.id });
        if (application) {
            return res.status(400).json({ status: false, message: 'Application already submitted.' });
        }
        next();
    } catch (error: any) {
        res.status(500).json({ status: false, message: error.message || 'Status check failed' });
    }
};

// Submit agent application form
export const submitApplication = [
    checkApplicationStatus,
    async (req: Request & { user?: IUser }, res: Response) => {
        try {
            const { fullName, phone, businessName, experienceYears, licenseNumber, bio, documents } = req.body;

            // Basic validation (expand as needed)
            if (!fullName || !phone || !experienceYears || !bio || !documents || !Array.isArray(documents)) {
                return res.status(400).json({ status: false, message: 'Missing required fields.' });
            }

            // Create application
            const application = new AgentApplication({
                userId: req.user?.id,
                fullName,
                phone,
                businessName,
                experienceYears,
                licenseNumber,
                bio,
                documents,
                status: AgentApplicationStatus.PENDING
            });
            await application.save();

            // Update user status
            const user = await User.User.findById(req.user?.id);
            if (user) {
                user.hasAppliedAsAgent = true;
                user.agentApplicationId = application._id;
                await user.save();
            }

            // Notify admin using agent's fullName for personalization
            await sendEmail(EMAIL_USER, 'New Agent Application', application._id.toString(), 'admin-alert', fullName);

            res.status(201).json({ 
                status: true, 
                message: 'Application submitted successfully. Awaiting review.', 
                data: { applicationId: application._id }
            });
        } catch (error: any) {
            console.error('Application submission error:', error);
            res.status(500).json({ status: false, message: error.message || 'Submission failed' });
        }
    }
];

// Get agent's own application status
export const getMyApplication = async (req: Request & { user?: IUser }, res: Response) => {
    try {
        const application = await AgentApplication.findOne({ userId: req.user?.id })
            .populate('reviewedBy', 'name email');  // Optional populate for reviewer details

        if (!application) {
            return res.status(404).json({ status: false, message: 'No application found.' });
        }

        res.json({ status: true, data: application });
    } catch (error: any) {
        console.error('Get application error:', error);
        res.status(500).json({ status: false, message: error.message || 'Retrieval failed' });
    }
};

// Get pending applications for admin review
export const getPendingApplications = async (req: Request, res: Response) => {
    try {
        const pending = await AgentApplication.find({ status: AgentApplicationStatus.PENDING })
            .populate('userId', 'name email role')  // Populate user details
            .sort({ appliedAt: -1 });  // Most recent first

        res.json({ status: true, data: pending });
    } catch (error: any) {
        console.error('Get pending applications error:', error);
        res.status(500).json({ status: false, message: error.message || 'Retrieval failed' });
    }
};

// Approve application
export const approveApplication = async (req: Request<{ id: string }> & { user?: IUser }, res: Response) => {
    try {
        const { id } = req.params;
        const application = await AgentApplication.findById(id).populate('userId', 'name email');  // Populate userId to access email and name

        if (!application || application.status !== AgentApplicationStatus.PENDING) {
            return res.status(400).json({ status: false, message: 'Invalid application or status.' });
        }

        // Update application
        application.status = AgentApplicationStatus.APPROVED;
        application.reviewedAt = new Date();
        application.reviewedBy = req.user?.id;
        await application.save();

        // Update user
        const user = await User.User.findById(application.userId);
        if (user) {
            user.isApproved = true;
            await user.save();
        }

        // Notify agent using populated email and name
        const agentEmail = (application.userId as any).email || '';  // Safe access after populate
        const agentName = (application.userId as any).name || '';  // Safe access after populate
        await sendEmail(agentEmail, 'Application Approved', '', 'approval', agentName);
        
        res.json({ status: true, message: 'Application approved successfully.' });
    } catch (error: any) {
        console.error('Approval error:', error);
        res.status(500).json({ status: false, message: error.message || 'Approval failed' });
    }
};

// Reject application
export const rejectApplication = async (req: Request<{ id: string }> & { user?: IUser }, res: Response) => {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;  // Optional reason from admin form
        const application = await AgentApplication.findById(id).populate('userId', 'email name');  // Populate userId to access email and name

        if (!application || application.status !== AgentApplicationStatus.PENDING) {
            return res.status(400).json({ status: false, message: 'Invalid application or status.' });
        }

        // Update application
        application.status = AgentApplicationStatus.REJECTED;
        application.reviewedAt = new Date();
        application.reviewedBy = req.user?.id;
        if (rejectionReason) {
            application.rejectionReason = rejectionReason;
        }
        await application.save();

        // Notify agent using populated email and name
        const agentEmail = (application.userId as any).email || '';  // Safe access after populate
        const agentName = (application.userId as any).name || '';  // Safe access after populate
        await sendEmail(agentEmail, 'Application Rejected', rejectionReason || '', 'rejection', agentName);

        res.json({ status: true, message: 'Application rejected successfully.' });
    } catch (error: any) {
        console.error('Rejection error:', error);
        res.status(500).json({ status: false, message: error.message || 'Rejection failed' });
    }
};

export default {
    submitApplication,
    getMyApplication,
    getPendingApplications,
    approveApplication,
    rejectApplication
};