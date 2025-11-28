"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_model_1 = __importDefault(require("../models/auth.model"));
const normalizeEmail = (email) => email.trim().toLowerCase();
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not configured');
    }
    return secret;
};
const registerUser = async (username, email, password) => {
    const normalizedEmail = normalizeEmail(email);
    const existing = await auth_model_1.default.findOne({ email: normalizedEmail });
    if (existing)
        throw new Error('User already exists');
    const hashed = await bcrypt_1.default.hash(password, 10);
    const user = new auth_model_1.default({ username, email: normalizedEmail, password: hashed });
    await user.save();
    const token = jsonwebtoken_1.default.sign({ userId: user._id }, getJwtSecret(), { expiresIn: '7d' });
    return { token, user: { id: user._id, username: user.username, email: user.email } };
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    const normalizedEmail = normalizeEmail(email);
    const user = await auth_model_1.default.findOne({ email: normalizedEmail });
    if (!user)
        throw new Error('Invalid credentials');
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch)
        throw new Error('Invalid credentials');
    const token = jsonwebtoken_1.default.sign({ userId: user._id }, getJwtSecret(), { expiresIn: '7d' });
    return { token, user: { id: user._id, username: user.username, email: user.email } };
};
exports.loginUser = loginUser;
const getUserProfile = async (userId) => {
    const user = await auth_model_1.default.findById(userId).select('-password');
    if (!user)
        throw new Error('User not found');
    return { id: user.id, username: user.username, email: user.email };
};
exports.getUserProfile = getUserProfile;
//# sourceMappingURL=auth.service.js.map