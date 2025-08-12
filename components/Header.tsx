import React from 'react';
import { RocketIcon } from './IconComponents';

type Tab = 'habits' | 'goals' | 'schedule' | 'quests' | 'progress';

interface HeaderProps {
    sublimePoints: number;
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

const Header: React.FC<HeaderProps> = ({ sublimePoints, activeTab, onTabChange }) => {
    return (
        <header
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0) + 0.75rem)' }}
            className="pb-3 px-4 md:px-8 flex justify-between items-center bg-gray-900/50 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-10"
        >
            <div className="flex items-center gap-2 md:gap-3">
                <RocketIcon className="w-7 h-7 md:w-8 md:h-8 text-cyan-400" />
                <h1 className="text-xl md:text-3xl font-bold font-orbitron text-white">SublimeQuest</h1>
            </div>
            <div className="flex items-center gap-4">
                <nav className="hidden md:flex gap-6 text-gray-300">
                    <button
                        onClick={() => onTabChange('progress')}
                        className={`hover:text-cyan-400 transition-colors ${activeTab === 'progress' ? 'text-white' : ''}`}
                    >
                        Progress
                    </button>
                    <button
                        onClick={() => onTabChange('habits')}
                        className={`hover:text-cyan-400 transition-colors ${activeTab === 'habits' ? 'text-white' : ''}`}
                    >
                        Habits
                    </button>
                    <button
                        onClick={() => onTabChange('goals')}
                        className={`hover:text-cyan-400 transition-colors ${activeTab === 'goals' ? 'text-white' : ''}`}
                    >
                        Goals
                    </button>
                    <button
                        onClick={() => onTabChange('schedule')}
                        className={`hover:text-cyan-400 transition-colors ${activeTab === 'schedule' ? 'text-white' : ''}`}
                    >
                        Schedule
                    </button>
                    <button
                        onClick={() => onTabChange('quests')}
                        className={`hover:text-cyan-400 transition-colors ${activeTab === 'quests' ? 'text-white' : ''}`}
                    >
                        Quests
                    </button>
                </nav>
                <div className="bg-yellow-400/10 border border-yellow-400/50 text-yellow-300 text-base md:text-lg font-semibold px-3 py-1.5 md:px-4 md:py-2 rounded-full flex items-center gap-2">
                    <span>{sublimePoints}</span>
                    <span className="text-yellow-500">SP</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
