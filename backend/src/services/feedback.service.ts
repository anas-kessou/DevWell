import { Types } from 'mongoose';
import FeedbackModel, { IFeedback } from '../models/feedback.model';

interface FeedbackInput {
	message: string;
	rating?: number;
	category?: string;
}

export const createFeedback = async (
	userId: string | undefined,
	{ message, rating, category }: FeedbackInput
): Promise<IFeedback> => {
	if (!message || !message.trim()) {
		throw new Error('Feedback message is required');
	}

	const normalizedRating =
		typeof rating === 'number' && rating >= 1 && rating <= 5 ? Math.round(rating) : undefined;

	const safeUserId = userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : undefined;

	return FeedbackModel.create({
		userId: safeUserId,
		message: message.trim(),
		rating: normalizedRating,
		category: category?.trim(),
	});
};

export const getRecentFeedback = async (limit = 50): Promise<IFeedback[]> => {
	const cappedLimit = Math.min(Math.max(limit, 1), 200);

	return FeedbackModel.find()
		.sort({ createdAt: -1 })
		.limit(cappedLimit);
};
