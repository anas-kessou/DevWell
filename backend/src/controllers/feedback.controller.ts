import { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';
import { createFeedback, getRecentFeedback } from '../services/feedback.service';

export const addFeedback = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const feedback = await createFeedback(req.userId, req.body ?? {});
		return res.status(201).json({ feedback });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unable to submit feedback';
		const status = message === 'Feedback message is required' ? 400 : 500;
		return res.status(status).json({ msg: message });
	}
};

export const listFeedback = async (req: Request, res: Response) => {
	const limit = Number.parseInt(String(req.query.limit ?? '50'), 10);

	try {
		const feedback = await getRecentFeedback(Number.isNaN(limit) ? 50 : limit);
		return res.json({ feedback });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unable to load feedback';
		return res.status(500).json({ msg: message });
	}
};
