import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IBooking, {}, {}, {}, mongoose.Document<unknown, {}, IBooking, {}, {}> & IBooking & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Booking.d.ts.map