"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refresh = exports.updateProfile = exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const cloudinary_1 = require("../config/cloudinary");
const jwtSecret_1 = require("../utils/jwtSecret");
const formatUser_1 = require("../utils/formatUser");
const generateAccessToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, (0, jwtSecret_1.getJwtSecret)(), {
        expiresIn: '15m',
    });
};
const generateRefreshToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, (0, jwtSecret_1.getJwtSecret)(), {
        expiresIn: '30d',
    });
};
const sendRefreshTokenCookie = (res, token) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
};
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        const userExists = await User_1.User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        let profileImageUrl = '';
        if (req.file) {
            profileImageUrl = await (0, cloudinary_1.uploadFile)(req.file.buffer, req.file.originalname, 'profiles', req.file.mimetype);
        }
        const user = await User_1.User.create({
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
            user: (0, formatUser_1.formatUserResponse)(user),
        });
    }
    catch (error) {
        console.error('Registration Error:', error);
        return res.status(500).json({ message: 'Server error during registration' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }
        const user = await User_1.User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password || '');
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = generateAccessToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());
        sendRefreshTokenCookie(res, refreshToken);
        return res.status(200).json({
            token,
            user: (0, formatUser_1.formatUserResponse)(user),
        });
    }
    catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ message: 'Server error during login' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        return res.status(200).json({
            user: (0, formatUser_1.formatUserResponse)(req.user),
        });
    }
    catch (error) {
        console.error('Get Profile Error:', error);
        return res.status(500).json({ message: 'Server error retrieving profile' });
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const { name, email, password } = req.body;
        const user = await User_1.User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (name)
            user.name = name;
        if (email && email !== user.email) {
            const emailExists = await User_1.User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            user.email = email;
        }
        if (password) {
            const salt = await bcryptjs_1.default.genSalt(10);
            user.password = await bcryptjs_1.default.hash(password, salt);
        }
        if (req.file) {
            user.profileImage = await (0, cloudinary_1.uploadFile)(req.file.buffer, req.file.originalname, 'profiles', req.file.mimetype);
        }
        await user.save();
        return res.status(200).json({
            message: 'Profile updated successfully',
            user: (0, formatUser_1.formatUserResponse)(user),
        });
    }
    catch (error) {
        console.error('Update Profile Error:', error);
        return res.status(500).json({ message: 'Server error updating profile' });
    }
};
exports.updateProfile = updateProfile;
const refresh = async (req, res) => {
    try {
        const cookies = req.headers.cookie?.split(';').reduce((acc, c) => {
            const [key, val] = c.trim().split('=');
            if (key && val)
                acc[key] = val;
            return acc;
        }, {}) || {};
        const refreshToken = cookies['refreshToken'];
        if (!refreshToken) {
            return res.status(401).json({ message: 'No refresh token provided' });
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(refreshToken, (0, jwtSecret_1.getJwtSecret)());
        }
        catch (err) {
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }
        const user = await User_1.User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        const newAccessToken = generateAccessToken(user._id.toString());
        const newRefreshToken = generateRefreshToken(user._id.toString());
        sendRefreshTokenCookie(res, newRefreshToken);
        return res.status(200).json({
            token: newAccessToken,
        });
    }
    catch (error) {
        console.error('Refresh Token Error:', error);
        return res.status(500).json({ message: 'Server error during token refresh' });
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    try {
        res.cookie('refreshToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0),
        });
        return res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (error) {
        console.error('Logout Error:', error);
        return res.status(500).json({ message: 'Server error during logout' });
    }
};
exports.logout = logout;
