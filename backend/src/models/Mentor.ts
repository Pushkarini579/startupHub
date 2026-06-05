import { Schema, model } from 'mongoose';
import { IMentor } from '../types';

const mentorSchema = new Schema<IMentor>(
  {
    name: {
      type: String,
      required: [true, 'Mentor name is required'],
      trim: true,
    },
    expertise: {
      type: String,
      required: [true, 'Expertise area is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    startupAssigned: {
      type: Schema.Types.ObjectId,
      ref: 'Startup',
      required: [true, 'Startup assignment is required'],
    },
  },
  {
    timestamps: true,
  }
);

export const Mentor = model<IMentor>('Mentor', mentorSchema);
export default Mentor;
