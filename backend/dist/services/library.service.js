"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.libraryService = exports.LibraryService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdfParse = require('pdf-parse');
const youtube_transcript_1 = require("youtube-transcript");
const generative_ai_1 = require("@google/generative-ai");
const uuid_1 = require("uuid");
const DATA_DIR = path_1.default.join(__dirname, '../../data');
const INDEX_FILE = path_1.default.join(DATA_DIR, 'library_index.json');
const UPLOADS_DIR = path_1.default.join(__dirname, '../../uploads');
// Ensure directories exist
if (!fs_1.default.existsSync(DATA_DIR))
    fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
if (!fs_1.default.existsSync(UPLOADS_DIR))
    fs_1.default.mkdirSync(UPLOADS_DIR, { recursive: true });
class LibraryService {
    constructor() {
        this.index = [];
        this.ai = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        this.loadIndex();
    }
    loadIndex() {
        if (fs_1.default.existsSync(INDEX_FILE)) {
            try {
                const data = fs_1.default.readFileSync(INDEX_FILE, 'utf-8');
                this.index = JSON.parse(data);
            }
            catch (error) {
                console.error('Failed to load library index:', error);
                this.index = [];
            }
        }
    }
    saveIndex() {
        fs_1.default.writeFileSync(INDEX_FILE, JSON.stringify(this.index, null, 2));
    }
    async getLibrary() {
        return this.index.map(({ embeddings, ...rest }) => rest);
    }
    async deleteItem(id) {
        const item = this.index.find(i => i.id === id);
        if (item && item.path && fs_1.default.existsSync(item.path)) {
            fs_1.default.unlinkSync(item.path);
        }
        this.index = this.index.filter(i => i.id !== id);
        this.saveIndex();
    }
    async processFile(file) {
        const id = (0, uuid_1.v4)();
        const item = {
            id,
            type: 'file',
            title: file.originalname,
            path: file.path,
            content: '',
            chunks: [],
            timestamp: new Date(),
            status: 'processing'
        };
        this.index.push(item);
        this.saveIndex();
        // Process in background
        this.processItemContent(item).catch(err => {
            console.error(`Error processing file ${item.id}:`, err);
            item.status = 'error';
            item.error = err.message;
            this.saveIndex();
        });
        return item;
    }
    async processLink(url) {
        const id = (0, uuid_1.v4)();
        const item = {
            id,
            type: 'link',
            title: url,
            url,
            content: '',
            chunks: [],
            timestamp: new Date(),
            status: 'processing'
        };
        this.index.push(item);
        this.saveIndex();
        // Process in background
        this.processItemContent(item).catch(err => {
            console.error(`Error processing link ${item.id}:`, err);
            item.status = 'error';
            item.error = err.message;
            this.saveIndex();
        });
        return item;
    }
    async processItemContent(item) {
        try {
            let text = '';
            if (item.type === 'file' && item.path) {
                if (item.path.endsWith('.pdf')) {
                    const dataBuffer = fs_1.default.readFileSync(item.path);
                    const data = await pdfParse(dataBuffer);
                    text = data.text;
                }
                else {
                    // Assume text file for now
                    text = fs_1.default.readFileSync(item.path, 'utf-8');
                }
            }
            else if (item.type === 'link' && item.url) {
                if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
                    const transcripts = await youtube_transcript_1.YoutubeTranscript.fetchTranscript(item.url || '');
                    text = transcripts.map(t => t.text).join(' ');
                    item.title = `YouTube: ${item.url || ''}`;
                }
                else {
                    // TODO: Implement generic web scraping
                    text = "Generic web scraping not implemented yet.";
                }
            }
            item.content = text;
            // Chunk text
            const chunkSize = 1000;
            const chunks = [];
            for (let i = 0; i < text.length; i += chunkSize) {
                chunks.push(text.slice(i, i + chunkSize));
            }
            item.chunks = chunks;
            // Generate embeddings
            // Note: GoogleGenAI SDK usage for embeddings might differ slightly based on version.
            // Assuming standard usage for now.
            // We need to use the embedding model.
            const model = this.ai.getGenerativeModel({ model: "text-embedding-004" });
            const embeddings = [];
            for (const chunk of chunks) {
                const result = await model.embedContent(chunk);
                embeddings.push(result.embedding.values);
            }
            item.embeddings = embeddings;
            item.status = 'ready';
            this.saveIndex();
        }
        catch (error) {
            console.error(`Processing failed for item ${item.id}:`, error);
            item.status = 'error';
            item.error = error.message || String(error);
            this.saveIndex();
            throw error;
        }
    }
    async search(query, limit = 3) {
        if (this.index.length === 0)
            return [];
        try {
            const model = this.ai.getGenerativeModel({ model: "text-embedding-004" });
            const result = await model.embedContent(query);
            const queryEmbedding = result.embedding.values;
            const results = [];
            for (const item of this.index) {
                if (item.status !== 'ready' || !item.embeddings)
                    continue;
                item.embeddings.forEach((embedding, idx) => {
                    if (!queryEmbedding)
                        return;
                    const score = this.cosineSimilarity(queryEmbedding, embedding);
                    if (score > 0.5) { // Threshold
                        results.push({
                            text: item.chunks[idx],
                            score,
                            source: item.title
                        });
                    }
                });
            }
            return results.sort((a, b) => b.score - a.score).slice(0, limit);
        }
        catch (error) {
            console.error("Search failed:", error);
            return [];
        }
    }
    cosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length)
            return 0;
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            const valA = vecA[i] || 0;
            const valB = vecB[i] || 0;
            dotProduct += valA * valB;
            normA += valA * valA;
            normB += valB * valB;
        }
        if (normA === 0 || normB === 0)
            return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
exports.LibraryService = LibraryService;
exports.libraryService = new LibraryService();
//# sourceMappingURL=library.service.js.map