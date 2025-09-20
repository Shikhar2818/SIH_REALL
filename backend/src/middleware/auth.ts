import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'student' | 'admin' | 'counsellor';
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header required' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    // Validate token format
    if (!token.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)) {
      console.error('Malformed JWT token:', token.substring(0, 20) + '...');
      res.status(401).json({ error: 'Invalid token format', code: 'MALFORMED_TOKEN' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development-only';
    const decoded = jwt.verify(token, secret) as { userId: string };
    const user = await User.findById(decoded.userId).select('-hashedPassword');

    if (!user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    // Handle specific JWT errors
    if (error instanceof jwt.TokenExpiredError) {
      console.error('Token expired for request:', req.path);
      res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
      return;
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('JWT error:', error.message, 'for request:', req.path);
      console.error('Token received:', req.headers.authorization?.substring(0, 50) + '...');
      res.status(401).json({ error: 'Invalid token', code: 'INVALID_TOKEN', details: error.message });
      return;
    } else if (error instanceof jwt.NotBeforeError) {
      console.error('Token not active yet:', error.message);
      res.status(401).json({ error: 'Token not active', code: 'TOKEN_NOT_ACTIVE' });
      return;
    }
    
    console.error('Unexpected auth error:', error);
    res.status(403).json({ error: 'Authentication failed' });
  }
};

export const authenticateRefreshToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token required' });
      return;
    }

    const secret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-for-development-only';
    const decoded = jwt.verify(refreshToken, secret) as { userId: string };
    const user = await User.findById(decoded.userId).select('-hashedPassword');

    if (!user) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireCounsellor = requireRole(['counsellor', 'admin']);
export const requireStudent = requireRole(['student', 'admin']);
