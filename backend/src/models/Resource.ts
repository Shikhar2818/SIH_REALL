import mongoose, { Document, Schema } from 'mongoose';

export interface IResource extends Document {
  title: string;
  description: string;
  content: string;
  category: 'article' | 'video' | 'document' | 'link' | 'exercise' | 'guide';
  tags: string[];
  authorId: mongoose.Types.ObjectId;
  isPublished: boolean;
  featured: boolean;
  viewCount: number;
  downloadCount: number;
  fileUrl?: string;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['article', 'video', 'document', 'link', 'exercise', 'guide'],
      required: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    fileUrl: {
      type: String,
    },
    thumbnailUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ResourceSchema.index({ title: 'text', description: 'text', content: 'text' });
ResourceSchema.index({ category: 1 });
ResourceSchema.index({ tags: 1 });
ResourceSchema.index({ isPublished: 1 });
ResourceSchema.index({ featured: 1 });
ResourceSchema.index({ authorId: 1 });

export default mongoose.model<IResource>('Resource', ResourceSchema);