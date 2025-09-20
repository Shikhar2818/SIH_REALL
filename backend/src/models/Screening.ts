import mongoose, { Document, Schema } from 'mongoose';

export interface IScreening extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'PHQ9' | 'GAD7';
  responses: {
    questionId: string;
    score: number;
  }[];
  totalScore: number;
  severity: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';
  createdAt: Date;
  updatedAt: Date;
}

const ScreeningSchema = new Schema<IScreening>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['PHQ9', 'GAD7'],
      required: true,
    },
    responses: [{
      questionId: {
        type: String,
        required: true,
      },
      score: {
        type: Number,
        min: 0,
        max: 3,
        required: true,
      },
    }],
    totalScore: {
      type: Number,
      required: true,
      min: 0,
    },
    severity: {
      type: String,
      enum: ['minimal', 'mild', 'moderate', 'moderately_severe', 'severe'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ScreeningSchema.index({ userId: 1 });
ScreeningSchema.index({ type: 1 });
ScreeningSchema.index({ severity: 1 });
ScreeningSchema.index({ createdAt: -1 });

export default mongoose.model<IScreening>('Screening', ScreeningSchema);
