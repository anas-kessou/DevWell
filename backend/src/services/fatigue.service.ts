import { Types } from 'mongoose';
import FatigueModel, { IFatigueRecord } from '../models/fatigue.model';

const sanitizeStatus = (status: string) => status.trim().toLowerCase();

interface RecordFatigueInput {
	status: string;
	confidence?: number;
	metrics?: Record<string, unknown>;
	capturedAt?: string | number | Date;
}

export const recordFatigueEvent = async (
	userId: string,
	{ status, confidence, metrics, capturedAt }: RecordFatigueInput
): Promise<IFatigueRecord> => {
	if (!Types.ObjectId.isValid(userId)) {
		throw new Error('Invalid user identifier');
	}

	if (!status || !status.trim()) {
		throw new Error('Status is required');
	}

	const safeConfidence =
		typeof confidence === 'number' && confidence >= 0 && confidence <= 1 ? confidence : undefined;

	const event = await FatigueModel.create({
		userId,
		status: sanitizeStatus(status),
		confidence: safeConfidence,
		metrics,
		capturedAt: capturedAt ? new Date(capturedAt) : new Date(),
	});

	return event;
};

export const getFatigueHistory = async (userId: string, limit = 50): Promise<IFatigueRecord[]> => {
	if (!Types.ObjectId.isValid(userId)) {
		throw new Error('Invalid user identifier');
	}

	const cappedLimit = Math.min(Math.max(limit, 1), 200);

	return FatigueModel.find({ userId })
		.sort({ capturedAt: -1 })
		.limit(cappedLimit)
		.exec();
};
