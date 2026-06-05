"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const Startup_1 = require("../models/Startup");
const Project_1 = require("../models/Project");
const cloudinary_1 = require("../config/cloudinary");
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { search, role } = req.query;
        const query = {};
        if (role) {
            query.role = role;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        const users = await User_1.User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await User_1.User.countDocuments(query);
        return res.status(200).json({
            users,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
            },
        });
    }
    catch (error) {
        console.error('Get Users Error:', error);
        return res.status(500).json({ message: 'Server error retrieving users' });
    }
};
exports.getUsers = getUsers;
const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        const userExists = await User_1.User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        let profileImage = '';
        if (req.file) {
            profileImage = await (0, cloudinary_1.uploadFile)(req.file.buffer, req.file.originalname, 'profiles', req.file.mimetype);
        }
        const user = await User_1.User.create({
            name,
            email,
            password: hashedPassword,
            role,
            profileImage,
        });
        return res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
            },
        });
    }
    catch (error) {
        console.error('Create User Error:', error);
        return res.status(500).json({ message: 'Server error creating user' });
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { name, email, password, role } = req.body;
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
        if (role) {
            user.role = role;
        }
        if (req.file) {
            user.profileImage = await (0, cloudinary_1.uploadFile)(req.file.buffer, req.file.originalname, 'profiles', req.file.mimetype);
        }
        await user.save();
        return res.status(200).json({
            message: 'User updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
            },
        });
    }
    catch (error) {
        console.error('Update User Error:', error);
        return res.status(500).json({ message: 'Server error updating user' });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Cascade delete user data (Startups owned by user and their projects)
        if (user.role === 'founder') {
            const startups = await Startup_1.Startup.find({ founderId: user._id }).select('_id');
            const startupIds = startups.map((s) => s._id);
            // Delete projects associated with these startups
            await Project_1.Project.deleteMany({ startupId: { $in: startupIds } });
            // Delete startups
            await Startup_1.Startup.deleteMany({ founderId: user._id });
        }
        await User_1.User.deleteOne({ _id: req.params.id });
        return res.status(200).json({ message: 'User and all associated data deleted successfully' });
    }
    catch (error) {
        console.error('Delete User Error:', error);
        return res.status(500).json({ message: 'Server error deleting user' });
    }
};
exports.deleteUser = deleteUser;
