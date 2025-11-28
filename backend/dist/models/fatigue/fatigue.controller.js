"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchFatigueHistory = exports.detectFatigue = void 0;
const fatigue_service_1 = require("./fatigue.service");
const detectFatigue = async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ msg: 'Unauthorized' });
    }
    try {
        const event = await (0, fatigue_service_1.recordFatigueEvent)(req.userId, req.body ?? {});
        return res.status(201).json({ event });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to record fatigue event';
        const status = message === 'Status is required' || message === 'Invalid user identifier' ? 400 : 500;
        return res.status(status).json({ msg: message });
    }
};
exports.detectFatigue = detectFatigue;
const fetchFatigueHistory = async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ msg: 'Unauthorized' });
    }
    const limit = Number.parseInt(String(req.query.limit ?? '50'), 10);
    try {
        const history = await (0, fatigue_service_1.getFatigueHistory)(req.userId, Number.isNaN(limit) ? 50 : limit);
        return res.json({ history });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load fatigue history';
        const status = message === 'Invalid user identifier' ? 400 : 500;
        return res.status(status).json({ msg: message });
    }
};
exports.fetchFatigueHistory = fetchFatigueHistory;
//# sourceMappingURL=fatigue.controller.js.map