import mongoose, { Document, Schema } from 'mongoose';

export interface ISessionRating extends Document {
  bookingId: mongoose.Types.ObjectId;
  counsellorId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  rating: number; // 1-5 stars
  feedback?: string;
  sessionQuality: number; // 1-5
  counsellorCommunication: number; // 1-5
  overallSatisfaction: number; // 1-5
  wouldRecommend: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SessionRatingSchema = new Schema<ISessionRating>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },
    counsellorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    sessionQuality: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    counsellorCommunication: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    overallSatisfaction: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    wouldRecommend: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

SessionRatingSchema.index({ counsellorId: 1 });
SessionRatingSchema.index({ studentId: 1 });
SessionRatingSchema.index({ bookingId: 1 });
SessionRatingSchema.index({ rating: 1 });

export default mongoose.model<ISessionRating>('SessionRating', SessionRatingSchema);
