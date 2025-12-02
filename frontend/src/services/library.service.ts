import { apiClient } from '../lib/apiClient';

export interface LibraryItem {
    id: string;
    type: 'file' | 'link';
    title: string;
    status: 'processing' | 'ready' | 'error';
    error?: string;
}

export const libraryService = {
    getLibrary: async (): Promise<LibraryItem[]> => {
        const response = await apiClient.get('/library');
        return response.data;
    },

    uploadFile: async (formData: FormData): Promise<LibraryItem> => {
        const response = await apiClient.post('/library/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    addLink: async (url: string): Promise<LibraryItem> => {
        const response = await apiClient.post('/library/link', { url });
        return response.data;
    },

    deleteItem: async (id: string): Promise<void> => {
        await apiClient.delete(`/library/${id}`);
    },
};
