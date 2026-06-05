import { Schema, model } from 'mongoose';
import { IProject } from '../types';

const projectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Under Review', 'Completed'],
      default: 'To Do',
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    startupId: {
      type: Schema.Types.ObjectId,
      ref: 'Startup',
      required: [true, 'Startup ID reference is required'],
    },
    assignedUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned user reference is required'],
    },
    attachment: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Project = model<IProject>('Project', projectSchema);
export default Project;
