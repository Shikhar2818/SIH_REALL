import mongoose, { Document, Schema } from 'mongoose';

export interface ICounsellorSchedule extends Document {
  counsellorId: mongoose.Types.ObjectId;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // Format: "09:00"
  endTime: string; // Format: "17:00"
  isAvailable: boolean;
  maxSessionsPerSlot: number;
  sessionDuration: number; // in minutes
  breakTime: number; // in minutes between sessions
  createdAt: Date;
  updatedAt: Date;
}

const CounsellorScheduleSchema = new Schema<ICounsellorSchedule>(
  {
    counsellorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    maxSessionsPerSlot: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    sessionDuration: {
      type: Number,
      default: 60, // 60 minutes
      min: 15,
      max: 180,
    },
    breakTime: {
      type: Number,
      default: 15, // 15 minutes
      min: 0,
      max: 60,
    },
  },
  {
    timestamps: true,
  }
);

CounsellorScheduleSchema.index({ counsellorId: 1, dayOfWeek: 1 });
CounsellorScheduleSchema.index({ counsellorId: 1, isAvailable: 1 });

export default mongoose.model<ICounsellorSchedule>('CounsellorSchedule', CounsellorScheduleSchema);
