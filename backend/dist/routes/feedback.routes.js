"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const feedback_controller_1 = require("../controllers/feedback.controller");
const router = (0, express_1.Router)();
router.post('/add', authMiddleware_1.default, feedback_controller_1.addFeedback);
router.get('/', feedback_controller_1.listFeedback);
exports.default = router;
//# sourceMappingURL=feedback.routes.js.map