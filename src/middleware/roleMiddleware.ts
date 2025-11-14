import { Request, Response, NextFunction } from 'express';
import type { IUser } from '../types'; 

// Interface to extend Request for user attachment (shared with authMiddleware)
interface AuthRequest extends Request {
    user?: IUser;
}

// Role-based Access Control Middleware (factory function)
// Usage: requireRole('admin') or requireRole(['admin', 'agent']) - accepts string or array of roles
export const requireRole = (requiredRole: string | string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        // Check if auth middleware was called first
        if (!req.user) {
            return res.status(401).json({
                status: false,
                message: 'Authentication required'
            });
        }

        const userRole = req.user.role;

        // Handle single role
        if (typeof requiredRole === 'string') {
            if (userRole !== requiredRole) {
                return res.status(403).json({
                    status: false,
                    message: `Access denied: ${requiredRole} role required`
                });
            }
        }
    
        // Handle multiple roles (array)
        if (Array.isArray(requiredRole)) {
            if (!requiredRole.includes(userRole)) {
                return res.status(403).json({
                    status: false,
                    message: `Access denied: One of [${requiredRole.join(', ')}] roles required`
                });
            }
        }

        next();
    };
};