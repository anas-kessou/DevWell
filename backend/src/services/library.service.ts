import fs from 'fs';
import path from 'path';
const pdfParse = require('pdf-parse');
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.join(__dirname, '../../data');
const INDEX_FILE = path.join(DATA_DIR, 'library_index.json');
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

export interface LibraryItem {
    id: string;
    type: 'file' | 'link';
    title: string;
    path?: string; // For files
    url?: string; // For links
    content: string; // Extracted text
    chunks: string[]; // Text chunks for embedding
    embeddings?: number[][]; // Vector embeddings for each chunk
    timestamp: Date;
    status: 'processing' | 'ready' | 'error';
    error?: string;
}

export class LibraryService {
    private index: LibraryItem[] = [];
    private ai: GoogleGenerativeAI;

    constructor() {
        this.ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        this.loadIndex();
    }

    private loadIndex() {
        if (fs.existsSync(INDEX_FILE)) {
            try {
                const data = fs.readFileSync(INDEX_FILE, 'utf-8');
                this.index = JSON.parse(data);
            } catch (error) {
                console.error('Failed to load library index:', error);
                this.index = [];
            }
        }
    }

    private saveIndex() {
        fs.writeFileSync(INDEX_FILE, JSON.stringify(this.index, null, 2));
    }

    async getLibrary(): Promise<Omit<LibraryItem, 'embeddings'>[]> {
        return this.index.map(({ embeddings, ...rest }) => rest);
    }

    async deleteItem(id: string): Promise<void> {
        const item = this.index.find(i => i.id === id);
        if (item && item.path && fs.existsSync(item.path)) {
            fs.unlinkSync(item.path);
        }
        this.index = this.index.filter(i => i.id !== id);
        this.saveIndex();
    }

    async processFile(file: any): Promise<LibraryItem> {
        const id = uuidv4();
        const item: LibraryItem = {
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

    async processLink(url: string): Promise<LibraryItem> {
        const id = uuidv4();
        const item: LibraryItem = {
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

    private async processItemContent(item: LibraryItem) {
        try {
            let text = '';

            if (item.type === 'file' && item.path) {
                if (item.path.endsWith('.pdf')) {
                    const dataBuffer = fs.readFileSync(item.path);
                    const data = await pdfParse(dataBuffer);
                    text = data.text;
                } else {
                    // Assume text file for now
                    text = fs.readFileSync(item.path, 'utf-8');
                }
            } else if (item.type === 'link' && item.url) {
                if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
                    const transcripts = await YoutubeTranscript.fetchTranscript(item.url || '');
                    text = transcripts.map(t => t.text).join(' ');
                    item.title = `YouTube: ${item.url || ''}`;
                } else {
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

        } catch (error: any) {
            console.error(`Processing failed for item ${item.id}:`, error);
            item.status = 'error';
            item.error = error.message || String(error);
            this.saveIndex();
            throw error;
        }
    }

    async search(query: string, limit: number = 3): Promise<{ text: string; score: number; source: string }[]> {
        if (this.index.length === 0) return [];

        try {
            const model = this.ai.getGenerativeModel({ model: "text-embedding-004" });
            const result = await model.embedContent(query);
            const queryEmbedding = result.embedding.values;

            const results: { text: string; score: number; source: string }[] = [];

            for (const item of this.index) {
                if (item.status !== 'ready' || !item.embeddings) continue;

                item.embeddings.forEach((embedding, idx) => {
                    if (!queryEmbedding) return;
                    const score = this.cosineSimilarity(queryEmbedding, embedding);
                    if (score > 0.5) { // Threshold
                        results.push({
                            text: item.chunks[idx],
                            score,
                            source: item.title as string
                        });
                    }
                });
            }

            return results.sort((a, b) => b.score - a.score).slice(0, limit);

        } catch (error) {
            console.error("Search failed:", error);
            return [];
        }
    }

    private cosineSimilarity(vecA: number[] | undefined, vecB: number[] | undefined): number {
        if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
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
        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}

export const libraryService = new LibraryService();
