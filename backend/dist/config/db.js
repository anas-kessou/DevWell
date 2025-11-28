"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('❌ MONGO_URI not set in .env file');
        console.error('Please create a .env file with: MONGO_URI=mongodb://localhost:27017/devwell');
        process.exit(1);
    }
    try {
        await mongoose_1.default.connect(uri);
        console.log('✅ MongoDB connected successfully');
    }
    catch (err) {
        console.error('❌ MongoDB connection error:', err);
        console.error('Please check your MONGO_URI in .env file');
        process.exit(1);
    }
};
exports.default = connectDB;
//# sourceMappingURL=db.js.map