import React from 'react';
import type { Avatar } from '../types';
import QuestCard from './QuestCard';
import { StarIcon } from './IconComponents';

interface DashboardProps {
    avatar: Avatar;
}

const Dashboard: React.FC<DashboardProps> = ({ avatar }) => {
    const progressPercentage = (avatar.currentXP / avatar.xpToNextLevel) * 100;

    return (
        <QuestCard className="col-span-1 md:col-span-2 lg:col-span-3">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                <div className="relative">
                    <img 
                        src={`https://picsum.photos/seed/${avatar.level}/150`} 
                        alt="Avatar" 
                        className="w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-cyan-400 shadow-lg shadow-cyan-500/30"
                    />
                    <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-gray-900 border-2 border-cyan-400 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-orbitron text-lg md:text-xl font-bold text-cyan-300">
                        {avatar.level}
                    </div>
                </div>
                <div className="flex-grow w-full text-center md:text-left">
                    <h2 className="font-orbitron text-xl md:text-2xl text-white mb-2">Level {avatar.level}</h2>
                    <p className="text-gray-300 mb-2 text-sm md:text-base">Current XP: {avatar.currentXP}</p>
                    <p className="text-gray-400 mb-4 text-sm md:text-base">Your journey to the sublime continues. Keep up the momentum!</p>
                    <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden border border-gray-600">
                        <div
                            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs md:text-sm text-gray-400 mt-2">
                        <span>XP: {avatar.currentXP} / {avatar.xpToNextLevel}</span>
                        <span><StarIcon className="w-4 h-4 inline-block mr-1 text-yellow-400" />Level Up!</span>
                    </div>
                </div>
            </div>
        </QuestCard>
    );
};

export default Dashboard;
