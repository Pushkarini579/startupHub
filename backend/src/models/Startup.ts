import { Schema, model } from 'mongoose';
import { IStartup } from '../types';

const startupSchema = new Schema<IStartup>(
  {
    startupName: {
      type: String,
      required: [true, 'Startup name is required'],
      trim: true,
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    fundingStage: {
      type: String,
      enum: ['Ideation', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Bootstrapped'],
      required: [true, 'Funding stage is required'],
    },
    logo: {
      type: String,
      default: '',
    },
    founderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Founder ID is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Startup = model<IStartup>('Startup', startupSchema);
export default Startup;
