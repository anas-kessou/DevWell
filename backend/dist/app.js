"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const fatigue_routes_1 = __importDefault(require("./routes/fatigue.routes"));
const feedback_routes_1 = __importDefault(require("./routes/feedback.routes"));
const chatbot_routes_1 = __importDefault(require("./routes/chatbot.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/api/test', (req, res) => {
    res.status(200).json({ message: '✅ Server is running successfully!' });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/user', user_routes_1.default);
app.use('/api/fatigue', fatigue_routes_1.default);
app.use('/api/feedback', feedback_routes_1.default);
app.use('/api/chatbot', chatbot_routes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map