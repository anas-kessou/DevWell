import { Document, Types } from 'mongoose';
export interface IFatigueRecord extends Document {
    userId: Types.ObjectId;
    status: string;
    confidence?: number;
    metrics?: Record<string, unknown>;
    capturedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: import("mongoose").Model<IFatigueRecord, {}, {}, {}, Document<unknown, {}, IFatigueRecord, {}, {}> & IFatigueRecord & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=fatigue.model.d.ts.map