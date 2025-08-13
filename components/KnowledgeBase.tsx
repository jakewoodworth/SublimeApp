import React, { useState } from 'react';
import QuestCard from './QuestCard';
import type { KnowledgeItem } from '../types';
import { XMarkIcon } from './IconComponents';

interface KnowledgeBaseProps {
    items: KnowledgeItem[];
    onAdd: (content: string) => void;
    onRemove: (id: string) => void;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ items, onAdd, onRemove }) => {
    const [input, setInput] = useState('');

    const handleAdd = () => {
        const trimmed = input.trim();
        if (!trimmed) return;
        onAdd(trimmed);
        setInput('');
    };

    return (
        <QuestCard className="col-span-1 md:col-span-2 lg:col-span-3">
            <h2 className="font-orbitron text-xl md:text-2xl text-white mb-4">Knowledge Base</h2>
            <ul className="text-gray-300 space-y-2 mb-4">
                {items.map(item => (
                    <li key={item.id} className="flex items-center justify-between text-sm md:text-base">
                        <span>• {item.content}</span>
                        <button
                            onClick={() => onRemove(item.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                            aria-label="Remove item"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </li>
                ))}
                {items.length === 0 && (
                    <li className="text-gray-500 text-sm md:text-base">No knowledge added yet.</li>
                )}
            </ul>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="flex-grow bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Add knowledge"
                />
                <button
                    onClick={handleAdd}
                    className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    Add
                </button>
            </div>
        </QuestCard>
    );
};

export default KnowledgeBase;
