"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const authMiddleware = async (req, res, next) => {
    const token = req.header('authorization') || req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret)
            return res.status(500).json({ msg: 'JWT_SECRET not configured' });
        const raw = token.startsWith('Bearer ') ? token.slice(7) : token;
        const decoded = jsonwebtoken_1.default.verify(raw, secret);
        //  Step 1: Attach userId
        req.userId = decoded.userId;
        //  Step 2: Check if user still exists
        const user = await user_model_1.default.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ msg: 'User does not exist' });
        }
        // Step 3: Attach full user object
        req.user = user;
        next();
    }
    catch (err) {
        return res.status(401).json({ msg: 'Invalid or expired token' });
    }
};
exports.default = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map