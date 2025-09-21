import mongoose, { Document } from 'mongoose';
export interface IAuditLog extends Document {
    action: string;
    userId?: mongoose.Types.ObjectId;
    resource: string;
    metadata: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IAuditLog, {}, {}, {}, mongoose.Document<unknown, {}, IAuditLog, {}, {}> & IAuditLog & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=AuditLog.d.ts.map