"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const FeedbackSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5 },
    category: { type: String, trim: true },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Feedback', FeedbackSchema);
//# sourceMappingURL=feedback.model.js.map