import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  studentId: mongoose.Types.ObjectId;
  counsellorId: mongoose.Types.ObjectId;
  slotStart: Date;
  slotEnd: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'rescheduled';
  notes?: string;
  counsellorNotes?: string;
  sessionSummary?: string;
  cancellationReason?: string;
  rescheduleReason?: string;
  isNoShow: boolean;
  actualStartTime?: Date;
  actualEndTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    counsellorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    slotStart: {
      type: Date,
      required: true,
    },
    slotEnd: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
    },
    counsellorNotes: {
      type: String,
      trim: true,
    },
    sessionSummary: {
      type: String,
      trim: true,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    rescheduleReason: {
      type: String,
      trim: true,
    },
    isNoShow: {
      type: Boolean,
      default: false,
    },
    actualStartTime: {
      type: Date,
    },
    actualEndTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

BookingSchema.index({ studentId: 1 });
BookingSchema.index({ counsellorId: 1 });
BookingSchema.index({ slotStart: 1 });
BookingSchema.index({ status: 1 });

export default mongoose.model<IBooking>('Booking', BookingSchema);
