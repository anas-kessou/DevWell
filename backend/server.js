"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const PORT = process.env.PORT || 5000;
const start = async () => {
    await (0, db_1.default)();
    app_1.default.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
};
start().catch((err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map