"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentFeedback = exports.createFeedback = void 0;
const mongoose_1 = require("mongoose");
const feedback_model_1 = __importDefault(require("../models/feedback.model"));
const createFeedback = async (userId, { message, rating, category }) => {
    if (!message || !message.trim()) {
        throw new Error('Feedback message is required');
    }
    const normalizedRating = typeof rating === 'number' && rating >= 1 && rating <= 5 ? Math.round(rating) : undefined;
    const safeUserId = userId && mongoose_1.Types.ObjectId.isValid(userId) ? new mongoose_1.Types.ObjectId(userId) : undefined;
    return feedback_model_1.default.create({
        userId: safeUserId,
        message: message.trim(),
        rating: normalizedRating,
        category: category?.trim(),
    });
};
exports.createFeedback = createFeedback;
const getRecentFeedback = async (limit = 50) => {
    const cappedLimit = Math.min(Math.max(limit, 1), 200);
    return feedback_model_1.default.find()
        .sort({ createdAt: -1 })
        .limit(cappedLimit);
};
exports.getRecentFeedback = getRecentFeedback;
//# sourceMappingURL=feedback.service.js.map