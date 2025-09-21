import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IForumPost, {}, {}, {}, mongoose.Document<unknown, {}, IForumPost, {}, {}> & IForumPost & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=ForumPost.d.ts.map