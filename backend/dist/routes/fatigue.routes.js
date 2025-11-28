"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const fatigue_controller_1 = require("../controllers/fatigue.controller");
const router = (0, express_1.Router)();
router.post('/detect', authMiddleware_1.default, fatigue_controller_1.detectFatigue);
router.get('/history', authMiddleware_1.default, fatigue_controller_1.fetchFatigueHistory);
exports.default = router;
//# sourceMappingURL=fatigue.routes.js.map