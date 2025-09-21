import mongoose, { Document } from 'mongoose';
export interface INotification extends Document {
    recipientId: mongoose.Types.ObjectId;
    senderId?: mongoose.Types.ObjectId;
    type: 'booking' | 'cancellation' | 'reschedule' | 'mental_health_alert' | 'system' | 'post_approval' | 'session_reminder';
    title: string;
    message: string;
    data?: any;
    isRead: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Notification.d.ts.map