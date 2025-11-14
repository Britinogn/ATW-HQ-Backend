import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import  User  from '../models/Users';  // Destructure the model explicitly

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';  // Use env var in production
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';  // Token expiration

// Middleware to protect routes: Verify JWT and attach user to req
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.',
      });
    }

    // Verify and decode token
    const decoded: { id: string } = jwt.verify(token, JWT_SECRET) as { id: string };
    
    // Fetch user from database (excluding sensitive fields)
    const user = await User.User.findById(decoded.id).select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. User not found.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Access denied. Invalid token.',
    });
  }
};

// Middleware for role-based authorization
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Access denied. Requires one of the following roles: ${roles.join(', ')}`,
      });
    }
    next();
  };
};