
import React from 'react';

interface NavbarProps {
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleTheme, isDarkMode }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-[#0f1016]/80 backdrop-blur-md z-50 border-b border-zinc-100 dark:border-zinc-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center transition-colors">
            <span className="text-white dark:text-black font-serif text-lg">D</span>
          </div>
          <span className="text-xl font-serif font-bold tracking-tight text-[#1a1c2e] dark:text-white">
            DreamSpace <span className="text-zinc-400 font-sans font-normal text-xs uppercase tracking-widest ml-1">AI</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-zinc-600 dark:text-zinc-400">
            <a href="#" className="hover:text-[#6366f1] transition-colors">How it works</a>
            <button className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-full text-xs font-extrabold hover:opacity-80 transition-all">Get Pro</button>
          </div>
        </div>
      </div>
    </nav>
  );
};
