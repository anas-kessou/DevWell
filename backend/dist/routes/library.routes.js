"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const library_controller_1 = require("../controllers/library.controller");
const router = express_1.default.Router();
// Configure Multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = (0, multer_1.default)({ storage });
router.post('/upload', upload.single('file'), library_controller_1.uploadFile);
router.post('/link', library_controller_1.addLink);
router.get('/', library_controller_1.getLibrary);
router.delete('/:id', library_controller_1.deleteItem);
exports.default = router;
//# sourceMappingURL=library.routes.js.map