import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { IUser } from '../types';
import { UserRole } from '../types/enums';
import User from '../models/Users';

// Response interfaces for type safety
export interface IAuthResponse {
    status: boolean;
    message: string;
    data?: { token?: string; user?: Partial<IUser> };
}

export interface IErrorResponse {
    status: boolean;
    message: string;
}

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';
const EMAIL_USER = process.env.EMAIL_USER!;
const EMAIL_PASS = process.env.EMAIL_PASS!;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Configure Nodemailer transporter for Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});


// Helper function to send verification/reset email (placeholder; integrate with your email service, e.g., nodemailer)
const sendEmail = async (to: string, subject: string, token: string, type: 'verification' | 'reset', name?: string): Promise<void> => {
    try {
        const verificationUrl = `${FRONTEND_URL}/auth/verify/${token}`;
        const resetUrl = `${FRONTEND_URL}/auth/reset/${token}`;

        // Fallback to email local part if name not provided
        const displayName = name || to.split("@")[0];

        const htmlTemplate = `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 0; margin: 0;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 0;">
                <tr>
                <td align="center">
                    <table width="600" style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: #111827; padding: 20px; text-align: center;">
                        <h2 style="color: white; margin: 0; font-size: 24px; letter-spacing: 1px;">
                            ATW HQ
                        </h2>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 30px 40px; color: #333333; font-size: 16px; line-height: 1.6;">
                        ${
                            type === "verification"
                            ? `
                                <h3 style="margin-top: 0; color: #111827;">Email Verification</h3>
                                <p>Hello ${displayName},</p>
                                <p>Welcome to ATW HQ. Kindly verify your email by clicking the button below.</p>
                                <div style="text-align: center; margin: 30px 0;">
                                <a href="${verificationUrl}" 
                                    style="background: #10B981; color: white; padding: 14px 30px; text-decoration: none; 
                                    font-size: 16px; border-radius: 6px; display: inline-block;">
                                    Verify Email
                                </a>
                                </div>
                                <p>If you did not create an account, kindly ignore this message.</p>
                            `
                            : `
                                <h3 style="margin-top: 0; color: #111827;">Password Reset</h3>
                                <p>Hello ${displayName},</p>
                                <p>You have requested to reset your password. Click the button below to continue.</p>
                                <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetUrl}" 
                                    style="background: #EF4444; color: white; padding: 14px 30px; text-decoration: none; 
                                    font-size: 16px; border-radius: 6px; display: inline-block;">
                                    Reset Password
                                </a>
                                </div>
                                <p>This link expires in 1 hour. If you didn't request this, kindly ignore this email.</p>
                            `
                        }
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: #F3F4F6; padding: 20px; text-align: center; font-size: 14px; color: #6B7280;">
                        <p style="margin: 0;">© ${new Date().getFullYear()} ATW HQ. All rights reserved.</p>
                        </td>
                    </tr>

                    </table>
                </td>
                </tr>
            </table>
            </div>
        
        `;


        await transporter.sendMail({
            from: `"ATW HQ" <${EMAIL_USER}>`,
            to,
            subject,
            html: htmlTemplate
        });

        console.log(`Email sent successfully to ${to} for ${type}`);
    } catch (error: any) {
        console.error(`Failed to send ${type} email to ${to}:`, error.message);
        // Do not throw; allow the API response to proceed
    }

    
};

// Helper function to generate JWT token
const generateToken = (userId: string): string => {
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
    return jwt.sign({ userId }, JWT_SECRET, options);
};

// Register User
export const register = async (
    req: Request<{}, IAuthResponse | IErrorResponse, { name: string; email: string; password: string; role?: UserRole }>,
    res: Response<IAuthResponse | IErrorResponse>
): Promise<void> => {
    try {
        const { name, email, password, role = 'user' as UserRole } = req.body;

        // Validation
        if (!name || !email || !password) {
            res.status(400).json({ status: false, message: 'Name, email, and password are required' });
            return;
        }

        // Check if user exists
        const existingUser = await User.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ status: false, message: 'User already exists' });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');

        // Create user
        const newUser: Partial<IUser> = {
            name,
            email,
            password: hashedPassword,
            role,
            isVerified: false,
            verificationToken,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const user = await User.User.create(newUser);

        // Send verification email
        await sendEmail(email, 'Email Verification', verificationToken, 'verification');

        res.status(201).json({
            status: true,
            message: 'User registered successfully. Please verify your email.',
            data: { user: { id: user._id.toString(), name, email, role } }
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({ status: false, message: error.message || 'Registration failed' });
    }
};


// Login User
export const login = async (
    req: Request<{}, IAuthResponse | IErrorResponse, { email: string; password: string }>,
    res: Response<IAuthResponse | IErrorResponse>
): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            res.status(400).json({ status: false, message: 'Email and password are required' });
            return;
        }

        // Find user
        const user = await User.User.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({ status: false, message: 'Invalid credentials' });
            return;
        }

        // Check if verified
        // if (!user.isVerified) {
        //     res.status(403).json({ status: false, message: 'Please verify your email first' });
        //     return;
        // }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ status: false, message: 'Invalid credentials' });
            return;
        }

        // Generate token
        const token = generateToken(user._id.toString());

        res.json({
            status: true,
            message: 'Login successful',
            data: {
                token,
                user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role }
            }
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ status: false, message: error.message || 'Login failed' });
    }
};

// verifyEmail

export const verifyEmail = async (
    req: Request<{ token: string }>,
    res: Response<IAuthResponse | IErrorResponse>
): Promise<void> => {
    try {
        const { token } = req.params;

        if (!token) {
            res.status(400).json({ status: false, message: "Verification token is required" });
            return;
        }

        // Find user with this token
        const user = await User.User.findOne({ verificationToken: token });

        if (!user) {
            res.status(400).json({ status: false, message: "Invalid or expired verification token" });
            return;
        }

        // Mark user as verified
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.json({
            status: true,
            message: "Email verified successfully. You can now log in."
        });
    } catch (error: any) {
        console.error("Verification error:", error);
        res.status(500).json({
            status: false,
            message: error.message || "Failed to verify email"
        });
    }
};


// Forgot Password
export const forgetPassword = async (
    req: Request<{}, IAuthResponse | IErrorResponse, { email: string }>,
    res: Response<IAuthResponse | IErrorResponse>
): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ status: false, message: 'Email is required' });
            return;
        }

        // Find user
        const user = await User.User.findOne({ email });
        if (!user) {
            res.status(404).json({ status: false, message: 'User not found' });
            return;
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour expiry

        // Update user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetPasswordExpires;
        await user.save();

        // Send reset email
        await sendEmail(email, 'Password Reset', resetToken, 'reset');

        res.json({ status: true, message: 'Reset link sent to your email' });
    } catch (error: any) {
        console.error('Forgot password error:', error);
        res.status(500).json({ status: false, message: error.message || 'Failed to send reset email' });
    }
};


// Reset Password
export const resetPassword = async (
    req: Request<{ token: string }, {}, { password: string }>,
    res: Response<IAuthResponse | IErrorResponse>
): Promise<void> => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token || !password) {
            res.status(400).json({ status: false, message: 'Token and password are required' });
            return;
        }

        // Find user with valid token
        const user = await User.User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            res.status(400).json({ status: false, message: 'Invalid or expired token' });
            return;
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update user
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.updatedAt = new Date();
        await user.save();

        res.json({ status: true, message: 'Password reset successful' });
    } catch (error: any) {
        console.error('Reset password error:', error);
        res.status(500).json({ status: false, message: error.message || 'Password reset failed' });
    }
};

// Get Profile (Protected)
export const profile = async (
    req: Request & { user?: IUser }, // Extend for user attachment from middleware
    res: Response<IAuthResponse | IErrorResponse>
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ status: false, message: 'Authentication required' });
            return;
        }

        // Explicitly construct profile to exclude sensitive fields and handle undefined optionals
        const userProfile: Partial<IUser> = {
            id: (req.user.id as string),
            name: req.user.name,
            email: req.user.email,
            ...(req.user.profile && { profile: req.user.profile }),
            role: req.user.role,
            ...(req.user.isVerified !== undefined && { isVerified: req.user.isVerified }),
            ...(req.user.createdAt && { createdAt: req.user.createdAt }),
            ...(req.user.updatedAt && { updatedAt: req.user.updatedAt })
        };

        res.json({
            status: true,
            message: 'Profile fetched successfully',
            data: { user: userProfile }
        });
    } catch (error: any) {
        console.error('Profile error:', error);
        res.status(500).json({ status: false, message: error.message || 'Failed to fetch profile' });
    }
};

export default {
    register,
    login,
    verifyEmail,
    forgetPassword,
    resetPassword,
    profile
};