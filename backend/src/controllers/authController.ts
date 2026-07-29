import { Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { uploadFile } from '../config/cloudinary';
import { getJwtSecret } from '../utils/jwtSecret';
import { formatUserResponse } from '../utils/formatUser';

const generateAccessToken = (id: string): string => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: '15m',
  });
};

const generateRefreshToken = (id: string): string => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: '30d',
  });
};

const sendRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profileImageUrl = '';
    if (req.file) {
      profileImageUrl = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        'profiles',
        req.file.mimetype
      );
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'founder',
      profileImage: profileImageUrl,
    });

    const token = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());
    sendRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());
    sendRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    return res.status(200).json({
      user: formatUserResponse(req.user),
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (req.file) {
      user.profileImage = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        'profiles',
        req.file.mimetype
      );
    }

    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ message: 'Server error updating profile' });
  }
};

export const refresh = async (req: AuthRequest, res: Response) => {
  try {
    const cookies = req.headers.cookie?.split(';').reduce((acc, c) => {
      const [key, val] = c.trim().split('=');
      if (key && val) acc[key] = val;
      return acc;
    }, {} as Record<string, string>) || {};
    const refreshToken = cookies['refreshToken'];

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, getJwtSecret());
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const newAccessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());
    sendRefreshTokenCookie(res, newRefreshToken);

    return res.status(200).json({
      token: newAccessToken,
    });
  } catch (error) {
    console.error('Refresh Token Error:', error);
    return res.status(500).json({ message: 'Server error during token refresh' });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
    });
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error);
    return res.status(500).json({ message: 'Server error during logout' });
  }
};

