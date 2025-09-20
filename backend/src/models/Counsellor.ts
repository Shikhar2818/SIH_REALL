import mongoose, { Document, Schema } from 'mongoose';

export interface ICounsellor extends Document {
  name: string;
  email: string;
  verified: boolean;
  languages: string[];
  availabilitySlots: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const CounsellorSchema = new Schema<ICounsellor>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: true,
    },
    languages: [{
      type: String,
      trim: true,
    }],
    availabilitySlots: [{
      dayOfWeek: {
        type: Number,
        min: 0,
        max: 6,
      },
      startTime: {
        type: String,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      },
      endTime: {
        type: String,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      },
    }],
  },
  {
    timestamps: true,
  }
);

CounsellorSchema.index({ email: 1 });
CounsellorSchema.index({ verified: 1 });

export default mongoose.model<ICounsellor>('Counsellor', CounsellorSchema);
