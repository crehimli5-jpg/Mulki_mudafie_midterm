import React from 'react';
import { ShieldCheck, Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onTitleClick?: () => void;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ onTitleClick, subtitle }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  const getThemeTitle = () => {
    return resolvedTheme === 'dark' ? 'İşıqlı rejimə keç' : 'Qaranlıq rejimə keç';
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onTitleClick}
          className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1 -m-1 transition-transform active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg flex items-center gap-2">
              <span>Mülki müdafiə</span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Özünüsınaq
              </span>
            </div>
            {subtitle ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {subtitle}
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden xs:block">
                İmtahana hazırlıq platforması
              </p>
            )}
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={getThemeTitle()}
            title={getThemeTitle()}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
