import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadFile, addLink, getLibrary, deleteItem } from '../controllers/library.controller';

const router = express.Router();

// Configure Multer
const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req: any, file: any, cb: any) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), uploadFile);
router.post('/link', addLink);
router.get('/', getLibrary);
router.delete('/:id', deleteItem);

export default router;
