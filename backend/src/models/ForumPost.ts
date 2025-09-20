import mongoose, { Document, Schema } from 'mongoose';

export interface IForumPost extends Document {
  authorId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  category: 'general' | 'anxiety' | 'depression' | 'stress' | 'support' | 'achievement';
  tags: string[];
  likes: mongoose.Types.ObjectId[];
  comments: {
    authorId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
  }[];
  isAnonymous: boolean;
  mood?: 'happy' | 'sad' | 'anxious' | 'stressed' | 'calm' | 'overwhelmed';
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ForumPostSchema = new Schema<IForumPost>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: ['general', 'anxiety', 'depression', 'stress', 'support', 'achievement'],
      default: 'general',
    },
    tags: [{
      type: String,
      trim: true,
    }],
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    comments: [{
      authorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    mood: {
      type: String,
      enum: ['happy', 'sad', 'anxious', 'stressed', 'calm', 'overwhelmed'],
    },
    isApproved: {
      type: Boolean,
      default: true, // Auto-approve for now, can be moderated later
    },
  },
  {
    timestamps: true,
  }
);

ForumPostSchema.index({ authorId: 1 });
ForumPostSchema.index({ category: 1 });
ForumPostSchema.index({ tags: 1 });
ForumPostSchema.index({ mood: 1 });
ForumPostSchema.index({ isApproved: 1 });
ForumPostSchema.index({ createdAt: -1 });

export default mongoose.model<IForumPost>('ForumPost', ForumPostSchema);
