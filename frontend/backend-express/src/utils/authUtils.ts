import jwt from 'jsonwebtoken';
import * as CryptoJS from 'crypto-js';
import { randomBytes } from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Default verification token expiration (24 hours)
export const VERIFICATION_TOKEN_EXPIRES_IN_HOURS = 24;

interface TokenPayload {
  id: number;
}

/**
 * Generate a JWT token for a user
 */
export const generateToken = (userId: number): string => {
  // Use alternative approach with ignoring TypeScript for the JWT options
  const payload = { id: userId };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return token;
};

/**
 * Verify a JWT token
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Hash a password using CryptoJS
 */
export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

/**
 * Verify if a password matches the hashed password
 */
export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  const hashedInput = CryptoJS.SHA256(password).toString();
  return hashedInput === hashedPassword;
};

/**
 * Generate a random token for email verification or password reset
 */
export const generateRandomToken = (): string => {
  return randomBytes(32).toString('hex');
};

/**
 * Generate an expiration date for a verification token
 * @param hoursValid How long the token should be valid for in hours
 * @returns Date object representing the expiration time
 */
export const generateTokenExpiration = (hoursValid: number = VERIFICATION_TOKEN_EXPIRES_IN_HOURS): Date => {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + hoursValid);
  return expiration;
}; 