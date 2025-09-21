import mongoose, { Document } from 'mongoose';
export interface ISessionRating extends Document {
    bookingId: mongoose.Types.ObjectId;
    counsellorId: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    rating: number;
    feedback?: string;
    sessionQuality: number;
    counsellorCommunication: number;
    overallSatisfaction: number;
    wouldRecommend: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ISessionRating, {}, {}, {}, mongoose.Document<unknown, {}, ISessionRating, {}, {}> & ISessionRating & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=SessionRating.d.ts.map