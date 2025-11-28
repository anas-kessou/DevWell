"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFatigueHistory = exports.recordFatigueEvent = void 0;
const mongoose_1 = require("mongoose");
const fatigue_model_1 = __importDefault(require("./fatigue.model"));
const sanitizeStatus = (status) => status.trim().toLowerCase();
const recordFatigueEvent = async (userId, { status, confidence, metrics, capturedAt }) => {
    if (!mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user identifier');
    }
    if (!status || !status.trim()) {
        throw new Error('Status is required');
    }
    const safeConfidence = typeof confidence === 'number' && confidence >= 0 && confidence <= 1 ? confidence : undefined;
    const event = await fatigue_model_1.default.create({
        userId,
        status: sanitizeStatus(status),
        confidence: safeConfidence,
        metrics,
        capturedAt: capturedAt ? new Date(capturedAt) : new Date(),
    });
    return event;
};
exports.recordFatigueEvent = recordFatigueEvent;
const getFatigueHistory = async (userId, limit = 50) => {
    if (!mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user identifier');
    }
    const cappedLimit = Math.min(Math.max(limit, 1), 200);
    return fatigue_model_1.default.find({ userId })
        .sort({ capturedAt: -1 })
        .limit(cappedLimit);
};
exports.getFatigueHistory = getFatigueHistory;
//# sourceMappingURL=fatigue.service.js.map