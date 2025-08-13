import React, { useState } from 'react';
import QuestCard from './QuestCard';
import type { KnowledgeItem } from '../types';

interface KnowledgeBaseProps {
    items: KnowledgeItem[];
    onAdd: (content: string) => void;
    onUpdate: (item: KnowledgeItem) => void;
    onDelete: (id: string) => void;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ items, onAdd, onUpdate, onDelete }) => {
    const [input, setInput] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState('');

    const handleAdd = () => {
        const trimmed = input.trim();
        if (!trimmed) return;
        onAdd(trimmed);
        setInput('');
    };

    const startEditing = (item: KnowledgeItem) => {
        setEditingId(item.id);
        setEditingValue(item.content);
    };

    const handleSave = () => {
        if (!editingId) return;
        const trimmed = editingValue.trim();
        if (!trimmed) return;
        onUpdate({ id: editingId, content: trimmed });
        setEditingId(null);
        setEditingValue('');
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditingValue('');
    };

    return (
        <QuestCard className="col-span-1 md:col-span-2 lg:col-span-3">
            <h2 className="font-orbitron text-xl md:text-2xl text-white mb-4">Knowledge Base</h2>
            <ul className="text-gray-300 space-y-2 mb-4">
                {items.map(item => (
                    <li key={item.id} className="flex items-center gap-2 text-sm md:text-base">
                        {editingId === item.id ? (
                            <>
                                <input
                                    type="text"
                                    value={editingValue}
                                    onChange={e => setEditingValue(e.target.value)}
                                    className="flex-grow bg-gray-700 text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                                <button
                                    onClick={handleSave}
                                    className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="flex-grow">• {item.content}</span>
                                <button
                                    onClick={() => startEditing(item)}
                                    className="text-cyan-400 hover:text-cyan-300 focus:outline-none"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => onDelete(item.id)}
                                    className="text-red-400 hover:text-red-300 focus:outline-none"
                                >
                                    Delete
                                </button>
                            </>
                        )}
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
