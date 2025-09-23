import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  username?: string;
  rollNumber?: string;
  collegeId?: string;
  hashedPassword?: string;
  consent: boolean;
  googleId?: string;
  role: 'student' | 'admin' | 'counsellor';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
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
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      trim: true,
    },
    collegeId: {
      type: String,
      trim: true,
    },
    hashedPassword: {
      type: String,
    },
    consent: {
      type: Boolean,
      required: true,
      default: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'counsellor'],
      default: 'student',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes are automatically created by unique: true in field definitions
// No need for explicit index creation

export default mongoose.model<IUser>('User', UserSchema);
