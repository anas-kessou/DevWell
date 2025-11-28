"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.updateProfile = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const updateProfile = async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const { username, bio } = req.body;
        const updateData = {};
        if (username)
            updateData.username = username.trim();
        if (bio !== undefined)
            updateData.bio = bio;
        const user = await user_model_1.default.findByIdAndUpdate(req.userId, { $set: updateData }, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    }
    catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
exports.updateProfile = updateProfile;
const deleteAccount = async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const user = await user_model_1.default.findByIdAndDelete(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json({ message: 'Account deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.deleteAccount = deleteAccount;
//# sourceMappingURL=user.controller.js.map