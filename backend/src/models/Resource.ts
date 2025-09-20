import mongoose, { Document, Schema } from 'mongoose';

export interface IResource extends Document {
  title: string;
  type: 'video' | 'audio' | 'pdf';
  language: string;
  fileRef: string; // File path or URL
  tags: string[];
  offlineAvailable: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['video', 'audio', 'pdf'],
      required: true,
    },
    language: {
      type: String,
      required: true,
      trim: true,
    },
    fileRef: {
      type: String,
      required: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    offlineAvailable: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

ResourceSchema.index({ type: 1 });
ResourceSchema.index({ language: 1 });
ResourceSchema.index({ tags: 1 });
ResourceSchema.index({ offlineAvailable: 1 });

export default mongoose.model<IResource>('Resource', ResourceSchema);
