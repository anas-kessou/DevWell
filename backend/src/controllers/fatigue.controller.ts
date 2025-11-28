import { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';
import { recordFatigueEvent, getFatigueHistory } from '../services/fatigue.service';

export const detectFatigue = async (req: AuthenticatedRequest, res: Response) => {
	if (!req.userId) {
		return res.status(401).json({ msg: 'Unauthorized' });
	}

	try {
		const event = await recordFatigueEvent(req.userId, req.body ?? {});
		return res.status(201).json({ event });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unable to record fatigue event';
		const status = message === 'Status is required' || message === 'Invalid user identifier' ? 400 : 500;
		return res.status(status).json({ msg: message });
	}
};

export const fetchFatigueHistory = async (req: AuthenticatedRequest, res: Response) => {
	if (!req.userId) {
		return res.status(401).json({ msg: 'Unauthorized' });
	}

	const limit = Number.parseInt(String(req.query.limit ?? '50'), 10);

	try {
		const history = await getFatigueHistory(req.userId, Number.isNaN(limit) ? 50 : limit);
		return res.json({ history });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unable to load fatigue history';
		const status = message === 'Invalid user identifier' ? 400 : 500;
		return res.status(status).json({ msg: message });
	}
};
