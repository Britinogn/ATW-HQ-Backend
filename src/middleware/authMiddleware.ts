import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import type { IUser } from '../types'; // Import the IUser type for typing
import User from '../models/Users'; // Default import for the User module

// Interface to extend Request for user attachment
interface AuthRequest extends Request {
    user?: IUser;
}

// JWT Secret (load from environment)
const JWT_SECRET = process.env.JWT_SECRET!;

// Authentication Middleware
export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                status: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token with expiration check (default behavior)
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const user = await User.User.findById(decoded.userId).select('-password'); // Access model via User.User

        if (!user) {
            return res.status(401).json({
                status: false,
                message: 'Invalid token. User not found.'
            });
        }

        req.user = user;
        next();
    } catch (error: any) {
        // Specific handling for expired tokens
        if (error instanceof TokenExpiredError) {
            return res.status(401).json({
                status: false,
                message: 'Token expired. Please log in again.'
            });
        }

        // Generic invalid token handling
        res.status(400).json({
            status: false,
            message: 'Invalid token.'
        });
    }
};

// Note: For token signing (e.g., in login routes), use the following pattern:
// jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '2h' });