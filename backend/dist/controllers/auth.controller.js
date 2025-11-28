"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const UserService = __importStar(require("../services/user.service"));
const register = async (req, res) => {
    try {
        const { username, name, email, password } = req.body ?? {};
        const resolvedUsername = typeof username === 'string' && username.trim().length > 0
            ? username
            : typeof name === 'string'
                ? name
                : undefined;
        if (!resolvedUsername || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const result = await UserService.registerUser(resolvedUsername, email, password);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await UserService.loginUser(email, password);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const user = await UserService.getUserProfile(req.userId);
        return res.json({ user });
    }
    catch (error) {
        const status = error.message === 'User not found' ? 404 : 500;
        return res.status(status).json({ message: error.message });
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=auth.controller.js.map