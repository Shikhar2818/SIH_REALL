import mongoose, { Document } from 'mongoose';
export interface ICounsellor extends Document {
    name: string;
    email: string;
    verified: boolean;
    languages: string[];
    availabilitySlots: {
        dayOfWeek: number;
        startTime: string;
        endTime: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICounsellor, {}, {}, {}, mongoose.Document<unknown, {}, ICounsellor, {}, {}> & ICounsellor & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Counsellor.d.ts.map