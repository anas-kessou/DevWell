import { Schema, model, Document, Types } from 'mongoose';

export interface IFatigueRecord extends Document {
	userId: Types.ObjectId;
	status: string;
	confidence?: number;
	metrics?: Record<string, unknown>;
	capturedAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

const FatigueSchema = new Schema<IFatigueRecord>(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		status: { type: String, required: true, trim: true },
		confidence: { type: Number, min: 0, max: 1 },
		metrics: { type: Schema.Types.Mixed },
		capturedAt: { type: Date, default: Date.now },
	},
	{
		timestamps: true,
	}
);

export default model<IFatigueRecord>('FatigueRecord', FatigueSchema);
