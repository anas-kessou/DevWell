import { Document, Types } from 'mongoose';
export interface IFeedback extends Document {
    userId?: Types.ObjectId;
    message: string;
    rating?: number;
    category?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: import("mongoose").Model<IFeedback, {}, {}, {}, Document<unknown, {}, IFeedback, {}, {}> & IFeedback & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=feedback.model.d.ts.map