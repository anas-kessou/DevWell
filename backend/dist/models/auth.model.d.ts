import mongoose, { Document } from 'mongoose';
interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=auth.model.d.ts.map