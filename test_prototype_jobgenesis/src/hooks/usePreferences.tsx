import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'dark' | 'light';
export type Difficulty = 'easy' | 'normal' | 'hard';

interface PreferencesContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    difficulty: Difficulty;
    setDifficulty: (diff: Difficulty) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize from localStorage or default values
    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = localStorage.getItem('jg_theme');
        return (saved as Theme) || 'dark';
    });

    const [difficulty, setDifficultyState] = useState<Difficulty>(() => {
        const saved = localStorage.getItem('jg_difficulty');
        return (saved as Difficulty) || 'normal';
    });

    // Update localStorage and root class when theme changes
    useEffect(() => {
        localStorage.setItem('jg_theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Update localStorage when difficulty changes
    useEffect(() => {
        localStorage.setItem('jg_difficulty', difficulty);
    }, [difficulty]);

    const setTheme = (newTheme: Theme) => setThemeState(newTheme);
    const setDifficulty = (newDiff: Difficulty) => setDifficultyState(newDiff);

    return (
        <PreferencesContext.Provider value={{ theme, setTheme, difficulty, setDifficulty }}>
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (context === undefined) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
};
