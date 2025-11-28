"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
// All user routes require authentication
router.use(authMiddleware_1.default);
// Update user profile (username, bio, etc.)
router.put('/profile', user_controller_1.updateProfile);
// Delete user account
router.delete('/account', user_controller_1.deleteAccount);
exports.default = router;
//# sourceMappingURL=user.routes.js.map