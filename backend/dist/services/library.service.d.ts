export interface LibraryItem {
    id: string;
    type: 'file' | 'link';
    title: string;
    path?: string;
    url?: string;
    content: string;
    chunks: string[];
    embeddings?: number[][];
    timestamp: Date;
    status: 'processing' | 'ready' | 'error';
    error?: string;
}
export declare class LibraryService {
    private index;
    private ai;
    constructor();
    private loadIndex;
    private saveIndex;
    getLibrary(): Promise<Omit<LibraryItem, 'embeddings'>[]>;
    deleteItem(id: string): Promise<void>;
    processFile(file: any): Promise<LibraryItem>;
    processLink(url: string): Promise<LibraryItem>;
    private processItemContent;
    search(query: string, limit?: number): Promise<{
        text: string;
        score: number;
        source: string;
    }[]>;
    private cosineSimilarity;
}
export declare const libraryService: LibraryService;
//# sourceMappingURL=library.service.d.ts.map