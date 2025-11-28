"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const FatigueSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, required: true, trim: true },
    confidence: { type: Number, min: 0, max: 1 },
    metrics: { type: mongoose_1.Schema.Types.Mixed },
    capturedAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)('FatigueRecord', FatigueSchema);
//# sourceMappingURL=fatigue.model.js.map