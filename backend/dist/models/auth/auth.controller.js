"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const auth_service_1 = require("./auth.service");
const isEmpty = (value) => typeof value === 'string' ? value.trim().length === 0 : value == null;
const register = async (req, res) => {
    const { username, email, password } = req.body ?? {};
    if ([username, email, password].some(isEmpty)) {
        return res.status(400).json({ msg: 'Missing required fields' });
    }
    try {
        const result = await (0, auth_service_1.registerUser)(username.trim(), email, password);
        return res.status(201).json(result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        const status = message === 'User already exists' ? 409 : 500;
        return res.status(status).json({ msg: message });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body ?? {};
    if ([email, password].some(isEmpty)) {
        return res.status(400).json({ msg: 'Missing required fields' });
    }
    try {
        const result = await (0, auth_service_1.loginUser)(email, password);
        return res.json(result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        const status = message === 'Invalid credentials' ? 401 : 500;
        return res.status(status).json({ msg: message });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ msg: 'Unauthorized' });
    }
    try {
        const user = await (0, auth_service_1.getUserProfile)(req.userId);
        return res.json({ user });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load profile';
        const status = message === 'User not found' ? 404 : 500;
        return res.status(status).json({ msg: message });
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=auth.controller.js.map