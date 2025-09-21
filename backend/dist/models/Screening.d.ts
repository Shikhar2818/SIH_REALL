import mongoose, { Document } from 'mongoose';
export interface IScreening extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'PHQ9' | 'GAD7' | 'PSS10' | 'DASS21';
    responses: {
        questionId: string;
        score: number;
    }[];
    totalScore: number;
    severity: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IScreening, {}, {}, {}, mongoose.Document<unknown, {}, IScreening, {}, {}> & IScreening & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Screening.d.ts.map