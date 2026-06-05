"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMentor = exports.updateMentor = exports.createMentor = exports.getMentorById = exports.getMentors = void 0;
const Mentor_1 = require("../models/Mentor");
const Startup_1 = require("../models/Startup");
const cloudinary_1 = require("../config/cloudinary");
const getMentors = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { search, expertise, startupId } = req.query;
        const query = {};
        // For founders, filter mentors assigned to their startups by default
        if (req.user.role === 'founder') {
            const scope = req.query.scope || 'my';
            if (scope === 'my') {
                const myStartups = await Startup_1.Startup.find({ founderId: req.user._id }).select('_id');
                query.startupAssigned = { $in: myStartups.map((s) => s._id) };
            }
        }
        // Specific startup filter
        if (startupId) {
            query.startupAssigned = startupId;
        }
        // Search filter
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        // Expertise filter
        if (expertise) {
            query.expertise = { $regex: expertise, $options: 'i' };
        }
        const mentors = await Mentor_1.Mentor.find(query)
            .populate('startupAssigned', 'startupName logo founderId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await Mentor_1.Mentor.countDocuments(query);
        return res.status(200).json({
            mentors,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
            },
        });
    }
    catch (error) {
        console.error('Get Mentors Error:', error);
        return res.status(500).json({ message: 'Server error retrieving mentors' });
    }
};
exports.getMentors = getMentors;
const getMentorById = async (req, res) => {
    try {
        const mentor = await Mentor_1.Mentor.findById(req.params.id).populate('startupAssigned', 'startupName logo founderId');
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }
        return res.status(200).json({ mentor });
    }
    catch (error) {
        console.error('Get Mentor By ID Error:', error);
        return res.status(500).json({ message: 'Server error retrieving mentor' });
    }
};
exports.getMentorById = getMentorById;
const createMentor = async (req, res) => {
    try {
        const { name, expertise, email, startupAssigned } = req.body;
        if (!name || !expertise || !email || !startupAssigned) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        // Verify startup exists
        const startup = await Startup_1.Startup.findById(startupAssigned);
        if (!startup) {
            return res.status(404).json({ message: 'Assigned startup not found' });
        }
        let profileImageUrl = '';
        if (req.file) {
            profileImageUrl = await (0, cloudinary_1.uploadFile)(req.file.buffer, req.file.originalname, 'mentors', req.file.mimetype);
        }
        const mentor = await Mentor_1.Mentor.create({
            name,
            expertise,
            email,
            profileImage: profileImageUrl,
            startupAssigned,
        });
        const populatedMentor = await Mentor_1.Mentor.findById(mentor._id).populate('startupAssigned', 'startupName logo');
        return res.status(201).json({
            message: 'Mentor profile created successfully',
            mentor: populatedMentor,
        });
    }
    catch (error) {
        console.error('Create Mentor Error:', error);
        return res.status(500).json({ message: 'Server error creating mentor' });
    }
};
exports.createMentor = createMentor;
const updateMentor = async (req, res) => {
    try {
        const mentor = await Mentor_1.Mentor.findById(req.params.id);
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor profile not found' });
        }
        const { name, expertise, email, startupAssigned } = req.body;
        if (name)
            mentor.name = name;
        if (expertise)
            mentor.expertise = expertise;
        if (email)
            mentor.email = email;
        if (startupAssigned) {
            const startup = await Startup_1.Startup.findById(startupAssigned);
            if (!startup) {
                return res.status(404).json({ message: 'Assigned startup not found' });
            }
            mentor.startupAssigned = startupAssigned;
        }
        if (req.file) {
            mentor.profileImage = await (0, cloudinary_1.uploadFile)(req.file.buffer, req.file.originalname, 'mentors', req.file.mimetype);
        }
        await mentor.save();
        const populatedMentor = await Mentor_1.Mentor.findById(mentor._id).populate('startupAssigned', 'startupName logo');
        return res.status(200).json({
            message: 'Mentor updated successfully',
            mentor: populatedMentor,
        });
    }
    catch (error) {
        console.error('Update Mentor Error:', error);
        return res.status(500).json({ message: 'Server error updating mentor' });
    }
};
exports.updateMentor = updateMentor;
const deleteMentor = async (req, res) => {
    try {
        const mentor = await Mentor_1.Mentor.findById(req.params.id);
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }
        await Mentor_1.Mentor.deleteOne({ _id: req.params.id });
        return res.status(200).json({ message: 'Mentor profile deleted successfully' });
    }
    catch (error) {
        console.error('Delete Mentor Error:', error);
        return res.status(500).json({ message: 'Server error deleting mentor' });
    }
};
exports.deleteMentor = deleteMentor;
