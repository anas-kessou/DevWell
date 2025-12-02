import { useEffect, useState } from 'react';

/**
 * Custom hook for managing dark mode state
 * Persists user preference in localStorage
 */
export const useDarkMode = () => {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        // Check localStorage for saved preference
        const saved = localStorage.getItem('darkMode');
        if (saved !== null) {
            return saved === 'true';
        }
        // Default to dark mode if no preference is saved
        return true;
    });

    useEffect(() => {
        const root = document.documentElement;

        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Save preference to localStorage
        localStorage.setItem('darkMode', isDarkMode.toString());
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

    return { isDarkMode, toggleDarkMode };
};
