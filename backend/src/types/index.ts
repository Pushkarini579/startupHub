import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'founder';
  profileImage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStartup extends Document {
  _id: Types.ObjectId;
  startupName: string;
  industry: string;
  description: string;
  fundingStage: 'Ideation' | 'Pre-Seed' | 'Seed' | 'Series A' | 'Series B' | 'Series C' | 'Bootstrapped';
  logo: string;
  founderId: Types.ObjectId | IUser;
  status: 'Pending' | 'Approved' | 'Rejected';
  website: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProject extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'Under Review' | 'Completed';
  deadline: Date;
  startupId: Types.ObjectId | IStartup;
  assignedUser: Types.ObjectId | IUser;
  attachment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMentor extends Document {
  _id: Types.ObjectId;
  name: string;
  expertise: string;
  email: string;
  profileImage: string;
  startupAssigned: Types.ObjectId | IStartup;
  createdAt: Date;
  updatedAt: Date;
}
