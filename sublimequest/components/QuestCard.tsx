import React from 'react';

interface QuestCardProps {
    children: React.ReactNode;
    className?: string;
}

const QuestCard: React.FC<QuestCardProps> = ({ children, className }) => {
    return (
        <div className={`
            bg-gray-800/50 
            backdrop-blur-sm 
            border border-blue-400/20 
            rounded-2xl 
            p-6 
            shadow-lg 
            shadow-blue-500/10 
            hover:border-blue-400/50 
            hover:shadow-blue-500/20 
            transition-all 
            duration-300
            ${className}
        `}>
            {children}
        </div>
    );
};

export default QuestCard;