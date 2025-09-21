import mongoose, { Document } from 'mongoose';
export interface ICounsellorSchedule extends Document {
    counsellorId: mongoose.Types.ObjectId;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    maxSessionsPerSlot: number;
    sessionDuration: number;
    breakTime: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICounsellorSchedule, {}, {}, {}, mongoose.Document<unknown, {}, ICounsellorSchedule, {}, {}> & ICounsellorSchedule & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=CounsellorSchedule.d.ts.map