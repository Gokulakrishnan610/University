import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../utils/authUtils';

const prisma = new PrismaClient();

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        verified: boolean;
        email: string;
        name: string | null;
      };
    }
  }
}

/**
 * Middleware to protect routes that require authentication
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      res.status(401).json({ message: 'Not authorized, no token provided' });
      return;
    }

    try {
      // Verify token
      const decoded = verifyToken(token);

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
      }

      // Add user to request
      req.user = { id: decoded.id, verified: user.isVerified, email: user.email, name: user.name };
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
}; 