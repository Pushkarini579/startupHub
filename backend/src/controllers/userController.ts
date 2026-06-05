import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Startup } from '../models/Startup';
import { Project } from '../models/Project';
import { Mentor } from '../models/Mentor';
import { AuthRequest } from '../middleware/authMiddleware';
import { uploadFile } from '../config/cloudinary';
import { formatUserResponse } from '../utils/formatUser';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { search, role } = req.query;

    const query: any = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    return res.status(200).json({
      users: users.map((user) => formatUserResponse(user)),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    return res.status(500).json({ message: 'Server error retrieving users' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profileImage = '';
    if (req.file) {
      profileImage = await uploadFile(
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
      role,
      profileImage,
    });

    return res.status(201).json({
      message: 'User created successfully',
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Create User Error:', error);
    return res.status(500).json({ message: 'Server error creating user' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, password, role } = req.body;

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

    if (role) {
      user.role = role;
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
      message: 'User updated successfully',
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Update User Error:', error);
    return res.status(500).json({ message: 'Server error updating user' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cascade delete user data (Startups owned by user and their projects)
    if (user.role === 'founder') {
      const startups = await Startup.find({ founderId: user._id }).select('_id');
      const startupIds = startups.map((s) => s._id);

      // Delete projects associated with these startups
      await Project.deleteMany({ startupId: { $in: startupIds } });

      // Delete mentors associated with these startups
      await Mentor.deleteMany({ startupAssigned: { $in: startupIds } });

      // Delete startups
      await Startup.deleteMany({ founderId: user._id });
    }

    // Also delete any project where this user was the direct assignee (if they weren't the founder)
    await Project.deleteMany({ assignedUser: user._id });

    await User.deleteOne({ _id: req.params.id });

    return res.status(200).json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    console.error('Delete User Error:', error);
    return res.status(500).json({ message: 'Server error deleting user' });
  }
};
