import { Moon, Sun } from 'lucide-react';
import { usePreferences } from '../hooks/usePreferences';

export const ThemeToggle = () => {
    const { theme, setTheme } = usePreferences();

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-xl border flex items-center justify-center transition-all ${theme === 'dark'
                    ? 'bg-dark-900 border-dark-700 text-dark-400 hover:border-neon-blue hover:text-neon-blue'
                    : 'bg-white border-gray-200 text-gray-400 hover:border-blue-500 hover:text-blue-500 shadow-sm'
                }`}
            title="Toggle Theme"
        >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
};
