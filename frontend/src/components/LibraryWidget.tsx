import { useState, useEffect } from 'react';
import { Library, Upload, Link as LinkIcon, FileText, Trash2, X, Loader } from 'lucide-react';
import { libraryService } from '../services/library.service';

interface LibraryItem {
    id: string;
    type: 'file' | 'link';
    title: string;
    status: 'processing' | 'ready' | 'error';
    error?: string;
}

export default function LibraryWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'upload' | 'library'>('library');
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');

    useEffect(() => {
        if (isOpen && activeTab === 'library') {
            fetchLibrary();
        }
    }, [isOpen, activeTab]);

    const fetchLibrary = async () => {
        setIsLoading(true);
        try {
            const data = await libraryService.getLibrary();
            setItems(data);
        } catch (error) {
            console.error('Failed to fetch library:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            await libraryService.uploadFile(formData);
            setActiveTab('library');
            fetchLibrary();
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleLinkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!linkUrl) return;

        setUploading(true);
        try {
            await libraryService.addLink(linkUrl);
            setLinkUrl('');
            setActiveTab('library');
            fetchLibrary();
        } catch (error) {
            console.error('Link add failed:', error);
            alert('Failed to add link');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await libraryService.deleteItem(id);
            fetchLibrary();
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-24 right-6 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-40 border border-gray-200 dark:border-gray-700 group"
                    aria-label="Open Personal Library"
                >
                    <Library className="w-5 h-5" />
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Personal Library
                    </div>
                </button>
            )}

            {/* Widget Modal */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex justify-between items-center">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Library className="w-4 h-4" />
                            My Library
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('library')}
                            className={`flex-1 py-2 text-sm font-medium ${activeTab === 'library' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            My Items
                        </button>
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`flex-1 py-2 text-sm font-medium ${activeTab === 'upload' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Add New
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 h-80 overflow-y-auto">
                        {activeTab === 'library' ? (
                            isLoading ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader className="w-6 h-6 animate-spin text-indigo-500" />
                                </div>
                            ) : items.length === 0 ? (
                                <div className="text-center text-gray-500 mt-10">
                                    <p>Library is empty.</p>
                                    <p className="text-xs mt-1">Add files or links to get started.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {items.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                {item.type === 'file' ? <FileText className="w-4 h-4 text-blue-500" /> : <LinkIcon className="w-4 h-4 text-red-500" />}
                                                <div className="truncate">
                                                    <p className="text-sm font-medium truncate text-gray-800 dark:text-gray-200" title={item.title}>{item.title}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {item.status === 'processing' ? 'Processing...' : item.status === 'error' ? 'Error' : 'Ready'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="space-y-4">
                                {/* File Upload */}
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept=".pdf,.txt,.md"
                                        disabled={uploading}
                                    />
                                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {uploading ? 'Uploading...' : 'Drop PDF or Text file here'}
                                    </p>
                                </div>

                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR</span>
                                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                                </div>

                                {/* Link Input */}
                                <form onSubmit={handleLinkSubmit} className="space-y-2">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Add YouTube Link</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={linkUrl}
                                            onChange={(e) => setLinkUrl(e.target.value)}
                                            placeholder="https://youtube.com/..."
                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                                            disabled={uploading}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!linkUrl || uploading}
                                            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            <LinkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
