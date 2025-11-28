import { Schema, model, Document, Types } from 'mongoose';

export interface IFeedback extends Document {
	userId?: Types.ObjectId;
	message: string;
	rating?: number;
	category?: string;
	createdAt: Date;
	updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User' },
		message: { type: String, required: true, trim: true },
		rating: { type: Number, min: 1, max: 5 },
		category: { type: String, trim: true },
	},
	{ timestamps: true }
);

export default model<IFeedback>('Feedback', FeedbackSchema);
