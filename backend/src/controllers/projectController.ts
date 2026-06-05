import { Response } from 'express';
import { Project } from '../models/Project';
import { Startup } from '../models/Startup';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { uploadFile } from '../config/cloudinary';
import { formatUserResponse } from '../utils/formatUser';

export const getAssignees = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (req.user.role === 'admin') {
      const users = await User.find().select('-password').sort({ name: 1 });
      return res.status(200).json({
        users: users.map((user) => formatUserResponse(user)),
      });
    }

    const myStartups = await Startup.find({ founderId: req.user._id }).select('_id');
    const myStartupIds = myStartups.map((startup) => startup._id);
    const assignedUserIds = await Project.distinct('assignedUser', {
      startupId: { $in: myStartupIds },
    });

    const uniqueIds = new Set<string>([req.user._id.toString()]);
    assignedUserIds.forEach((id) => uniqueIds.add(id.toString()));

    const users = await User.find({ _id: { $in: Array.from(uniqueIds) } })
      .select('-password')
      .sort({ name: 1 });

    return res.status(200).json({
      users: users.map((user) => formatUserResponse(user)),
    });
  } catch (error) {
    console.error('Get Assignees Error:', error);
    return res.status(500).json({ message: 'Server error retrieving assignees' });
  }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { search, status, priority, startupId } = req.query;

    const query: any = {};

    // Enforce data access bounds:
    // Founders only see projects belonging to startups they own
    if (req.user.role === 'founder') {
      const myStartups = await Startup.find({ founderId: req.user._id }).select('_id');
      const myStartupIds = myStartups.map((s) => s._id);

      if (startupId) {
        // Must be one of the founder's own startups
        const isValidId = myStartupIds.some((id) => id.toString() === startupId.toString());
        if (!isValidId) {
          return res.status(403).json({ message: 'Forbidden: You do not own the requested startup' });
        }
        query.startupId = startupId;
      } else {
        query.startupId = { $in: myStartupIds };
      }
    } else {
      // Admin can filter by any startupId
      if (startupId) {
        query.startupId = startupId;
      }
    }

    // Search filter
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Dropdown filters
    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    const projects = await Project.find(query)
      .populate('startupId', 'startupName logo')
      .populate('assignedUser', 'name email profileImage')
      .sort({ deadline: 1 }) // Nearest deadline first
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments(query);

    return res.status(200).json({
      projects,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    console.error('Get Projects Error:', error);
    return res.status(500).json({ message: 'Server error retrieving projects' });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const project = await Project.findById(req.params.id)
      .populate('startupId', 'startupName logo founderId')
      .populate('assignedUser', 'name email profileImage');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Authorize: Admin or startup owner founder
    if (req.user.role === 'founder') {
      const startup = project.startupId as any; // Populated
      if (startup.founderId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden: Access to this project is denied' });
      }
    }

    return res.status(200).json({ project });
  } catch (error) {
    console.error('Get Project By ID Error:', error);
    return res.status(500).json({ message: 'Server error retrieving project' });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { title, description, priority, status, deadline, startupId, assignedUser } = req.body;

    if (!title || !description || !deadline || !startupId || !assignedUser) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Verify ownership of the startup if user is founder
    if (req.user.role === 'founder') {
      const startup = await Startup.findOne({ _id: startupId, founderId: req.user._id });
      if (!startup) {
        return res.status(403).json({ message: 'Forbidden: You do not own this startup' });
      }
    }

    let attachmentUrl = '';
    if (req.file) {
      attachmentUrl = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        'projects',
        req.file.mimetype
      );
    }

    const project = await Project.create({
      title,
      description,
      priority: priority || 'Medium',
      status: status || 'To Do',
      deadline: new Date(deadline),
      startupId,
      assignedUser,
      attachment: attachmentUrl,
    });

    const populatedProject = await Project.findById(project._id)
      .populate('startupId', 'startupName logo')
      .populate('assignedUser', 'name email profileImage');

    return res.status(201).json({
      message: 'Project task created successfully',
      project: populatedProject,
    });
  } catch (error) {
    console.error('Create Project Error:', error);
    return res.status(500).json({ message: 'Server error creating project' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project task not found' });
    }

    // Verify ownership if founder
    if (req.user.role === 'founder') {
      const startup = await Startup.findOne({ _id: project.startupId, founderId: req.user._id });
      if (!startup) {
        return res.status(403).json({ message: 'Forbidden: You cannot modify projects for this startup' });
      }
    }

    const { title, description, priority, status, deadline, assignedUser } = req.body;

    if (title) project.title = title;
    if (description) project.description = description;
    if (priority) project.priority = priority;
    if (status) project.status = status;
    if (deadline) project.deadline = new Date(deadline);
    if (assignedUser) project.assignedUser = assignedUser;

    if (req.file) {
      project.attachment = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        'projects',
        req.file.mimetype
      );
    }

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('startupId', 'startupName logo')
      .populate('assignedUser', 'name email profileImage');

    return res.status(200).json({
      message: 'Project updated successfully',
      project: populatedProject,
    });
  } catch (error) {
    console.error('Update Project Error:', error);
    return res.status(500).json({ message: 'Server error updating project' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project task not found' });
    }

    // Verify ownership if founder
    if (req.user.role === 'founder') {
      const startup = await Startup.findOne({ _id: project.startupId, founderId: req.user._id });
      if (!startup) {
        return res.status(403).json({ message: 'Forbidden: You cannot delete projects for this startup' });
      }
    }

    await Project.deleteOne({ _id: req.params.id });

    return res.status(200).json({ message: 'Project task deleted successfully' });
  } catch (error) {
    console.error('Delete Project Error:', error);
    return res.status(500).json({ message: 'Server error deleting project' });
  }
};
