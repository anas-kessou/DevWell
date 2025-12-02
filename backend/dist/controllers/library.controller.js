"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = exports.getLibrary = exports.addLink = exports.uploadFile = void 0;
const library_service_1 = require("../services/library.service");
const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ msg: 'No file uploaded' });
            return;
        }
        const item = await library_service_1.libraryService.processFile(req.file);
        res.json(item);
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};
exports.uploadFile = uploadFile;
const addLink = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            res.status(400).json({ msg: 'URL is required' });
            return;
        }
        const item = await library_service_1.libraryService.processLink(url);
        res.json(item);
    }
    catch (error) {
        console.error('Link error:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};
exports.addLink = addLink;
const getLibrary = async (req, res) => {
    try {
        const items = await library_service_1.libraryService.getLibrary();
        res.json(items);
    }
    catch (error) {
        console.error('Get library error:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};
exports.getLibrary = getLibrary;
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        await library_service_1.libraryService.deleteItem(id);
        res.json({ msg: 'Item deleted' });
    }
    catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};
exports.deleteItem = deleteItem;
//# sourceMappingURL=library.controller.js.map