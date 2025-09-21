import mongoose, { Document } from 'mongoose';
export interface IResource extends Document {
    title: string;
    description: string;
    content: string;
    category: 'article' | 'video' | 'audio' | 'document' | 'link' | 'exercise' | 'guide';
    tags: string[];
    authorId: mongoose.Types.ObjectId;
    isPublished: boolean;
    featured: boolean;
    viewCount: number;
    downloadCount: number;
    fileUrl?: string;
    thumbnailUrl?: string;
    youtubeId?: string;
    youtubeUrl?: string;
    duration?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IResource, {}, {}, {}, mongoose.Document<unknown, {}, IResource, {}, {}> & IResource & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Resource.d.ts.map