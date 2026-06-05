import { Response } from 'express';
import { Startup } from '../models/Startup';
import { Project } from '../models/Project';
import { Mentor } from '../models/Mentor';
import { AuthRequest } from '../middleware/authMiddleware';
import { uploadFile } from '../config/cloudinary';

export const getStartups = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { search, industry, fundingStage, status } = req.query;

    const query: any = {};

    // Scope check: founders only see their startups, admins see everything
    if (req.user.role === 'founder') {
      const scope = req.query.scope || 'my';
      if (scope === 'my') {
        query.founderId = req.user._id;
        if (status) {
          query.status = status;
        }
      } else {
        // Founders browsing the incubator directory see approved startups only
        query.status = 'Approved';
      }
    } else if (status) {
      query.status = status;
    }

    // Search filter
    if (search) {
      query.startupName = { $regex: search, $options: 'i' };
    }

    // Category filters
    if (industry) {
      query.industry = industry;
    }

    if (fundingStage) {
      query.fundingStage = fundingStage;
    }

    const startups = await Startup.find(query)
      .populate('founderId', 'name email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Startup.countDocuments(query);

    return res.status(200).json({
      startups,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    console.error('Get Startups Error:', error);
    return res.status(500).json({ message: 'Server error retrieving startups' });
  }
};

export const getStartupById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const startup = await Startup.findById(req.params.id).populate('founderId', 'name email profileImage');
    if (!startup) {
      return res.status(404).json({ message: 'Startup not found' });
    }

    // Authorization check: Admin can access any startup; Founder can access if owner OR if startup is approved.
    if (req.user.role === 'founder') {
      const isOwner = startup.founderId._id.toString() === req.user._id.toString();
      const isApproved = startup.status === 'Approved';
      if (!isOwner && !isApproved) {
        return res.status(403).json({ message: 'Forbidden: Access to this startup profile is restricted' });
      }
    }

    return res.status(200).json({ startup });
  } catch (error) {
    console.error('Get Startup By ID Error:', error);
    return res.status(500).json({ message: 'Server error retrieving startup' });
  }
};

export const createStartup = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { startupName, industry, description, fundingStage, website } = req.body;

    if (!startupName || !industry || !description || !fundingStage) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    let logoUrl = '';
    if (req.file) {
      logoUrl = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        'logos',
        req.file.mimetype
      );
    }

    // Default status for founder is Pending. Admins can specify status or default to Approved.
    let status = req.user.role === 'admin' ? 'Approved' : 'Pending';
    if (req.user.role === 'admin' && req.body.status) {
      status = req.body.status;
    }

    const startup = await Startup.create({
      startupName,
      industry,
      description,
      fundingStage,
      website,
      logo: logoUrl,
      founderId: req.user._id,
      status,
    });

    return res.status(201).json({
      message: 'Startup registered successfully',
      startup,
    });
  } catch (error) {
    console.error('Create Startup Error:', error);
    return res.status(500).json({ message: 'Server error registering startup' });
  }
};

export const updateStartup = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const startup = await Startup.findById(req.params.id);
    if (!startup) {
      return res.status(404).json({ message: 'Startup not found' });
    }

    // Authorization: Owner or Admin
    if (req.user.role !== 'admin' && startup.founderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not own this startup' });
    }

    const { startupName, industry, description, fundingStage, website, status } = req.body;

    if (startupName) startup.startupName = startupName;
    if (industry) startup.industry = industry;
    if (description) startup.description = description;
    if (fundingStage) startup.fundingStage = fundingStage;
    if (website !== undefined) startup.website = website;

    // Admin can update status
    if (status && req.user.role === 'admin') {
      startup.status = status;
    }

    if (req.file) {
      startup.logo = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        'logos',
        req.file.mimetype
      );
    }

    await startup.save();

    return res.status(200).json({
      message: 'Startup updated successfully',
      startup,
    });
  } catch (error) {
    console.error('Update Startup Error:', error);
    return res.status(500).json({ message: 'Server error updating startup' });
  }
};

export const approveStartup = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Choose Approved or Rejected.' });
    }

    const startup = await Startup.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!startup) {
      return res.status(404).json({ message: 'Startup not found' });
    }

    return res.status(200).json({
      message: `Startup status updated to ${status} successfully`,
      startup,
    });
  } catch (error) {
    console.error('Approve Startup Error:', error);
    return res.status(500).json({ message: 'Server error changing status' });
  }
};

export const deleteStartup = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const startup = await Startup.findById(req.params.id);
    if (!startup) {
      return res.status(404).json({ message: 'Startup not found' });
    }

    // Owner or Admin
    if (req.user.role !== 'admin' && startup.founderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You cannot delete this startup' });
    }

    // Cascade delete associated projects and mentors
    await Project.deleteMany({ startupId: req.params.id });
    await Mentor.deleteMany({ startupAssigned: req.params.id });

    // We use deleteOne in mongoose 8
    await Startup.deleteOne({ _id: req.params.id });

    return res.status(200).json({ message: 'Startup deleted successfully' });
  } catch (error) {
    console.error('Delete Startup Error:', error);
    return res.status(500).json({ message: 'Server error deleting startup' });
  }
};
