import { Request, Response } from 'express';
import { libraryService } from '../services/library.service';

export const uploadFile = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ msg: 'No file uploaded' });
            return;
        }

        const item = await libraryService.processFile(req.file);
        res.json(item);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

export const addLink = async (req: Request, res: Response) => {
    try {
        const { url } = req.body;
        if (!url) {
            res.status(400).json({ msg: 'URL is required' });
            return;
        }

        const item = await libraryService.processLink(url);
        res.json(item);
    } catch (error) {
        console.error('Link error:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

export const getLibrary = async (req: Request, res: Response) => {
    try {
        const items = await libraryService.getLibrary();
        res.json(items);
    } catch (error) {
        console.error('Get library error:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

export const deleteItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await libraryService.deleteItem(id);
        res.json({ msg: 'Item deleted' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};
