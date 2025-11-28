"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFeedback = exports.addFeedback = void 0;
const feedback_service_1 = require("./feedback.service");
const addFeedback = async (req, res) => {
    try {
        const feedback = await (0, feedback_service_1.createFeedback)(req.userId, req.body ?? {});
        return res.status(201).json({ feedback });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to submit feedback';
        const status = message === 'Feedback message is required' ? 400 : 500;
        return res.status(status).json({ msg: message });
    }
};
exports.addFeedback = addFeedback;
const listFeedback = async (req, res) => {
    const limit = Number.parseInt(String(req.query.limit ?? '50'), 10);
    try {
        const feedback = await (0, feedback_service_1.getRecentFeedback)(Number.isNaN(limit) ? 50 : limit);
        return res.json({ feedback });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load feedback';
        return res.status(500).json({ msg: message });
    }
};
exports.listFeedback = listFeedback;
//# sourceMappingURL=feedback.controller.js.map