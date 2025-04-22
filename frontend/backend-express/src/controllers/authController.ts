import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  generateRandomToken,
  generateTokenExpiration 
} from '../utils/authUtils';
import { 
  sendVerificationEmail, 
  sendPasswordResetEmail 
} from '../utils/emailService';

const prisma = new PrismaClient();

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    // Generate verification token
    const verificationToken = generateRandomToken();
    const expires = generateTokenExpiration();

    // Hash password
    const hashedPassword = hashPassword(password);

    // Create new user with a verification token
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        verificationTokens: {
          create: {
            token: verificationToken,
            expires
          }
        }
      },
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      userId: newUser.id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
};

/**
 * Verify user email
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    // Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true }
    });

    // Check if token exists and is not expired
    if (!verificationToken) {
      res.status(400).json({ message: 'Invalid verification token' });
      return;
    }

    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id }
      });
      
      res.status(400).json({ 
        message: 'Verification token has expired. Please request a new one.',
        expired: true
      });
      return;
    }

    // Update user to verified
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: {
        isVerified: true,
      },
    });

    // Delete the used verification token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    });

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Failed to verify email' });
  }
};

/**
 * Log in user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isPasswordValid = verifyPassword(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check if user is verified
    if (!user.isVerified) {
      res.status(401).json({ 
        message: 'Please verify your email before logging in',
        needsVerification: true 
      });
      return;
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Set cookie with user id
    res.cookie('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax'
    });

    // Return user info and token
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to log in' });
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent' });
      return;
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    // Send password reset email
    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({
      message: 'Password reset link sent to your email',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Failed to process password reset request' });
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      res.status(400).json({ message: 'New password is required' });
      return;
    }

    // Find user with this reset token and check if token is expired
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired password reset token' });
      return;
    }

    // Hash new password
    const hashedPassword = hashPassword(password);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    res.status(200).json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

/**
 * Resend verification email
 */
export const resendVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { verificationTokens: true }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      res.status(200).json({ message: 'If an account with that email exists, a verification link has been sent' });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ message: 'This account is already verified' });
      return;
    }

    // Delete any existing verification tokens for this user
    if (user.verificationTokens.length > 0) {
      await prisma.verificationToken.deleteMany({
        where: { userId: user.id }
      });
    }

    // Generate new verification token with expiration
    const verificationToken = generateRandomToken();
    const expires = generateTokenExpiration();

    // Create new verification token
    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        expires,
        userId: user.id
      }
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({
      message: 'Verification email has been resent',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Failed to resend verification email' });
  }
};

/**
 * Get current user information
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get user id from cookie
    const userId = req.cookies?.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Return user info (excluding password)
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Failed to get user information' });
  }
};

/**
 * Log out user
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Clear the user id cookie
    res.clearCookie('userId');
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Failed to log out' });
  }
}; 