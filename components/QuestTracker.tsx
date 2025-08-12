import React, { useState } from 'react';
import type { Quest } from '../types';
import QuestCard from './QuestCard';
import { SparklesIcon, PlusIcon, StarIcon, TrophyIcon, PencilIcon, TrashIcon, XMarkIcon, ArrowUturnLeftIcon } from './IconComponents';

interface QuestTrackerProps {
    quests: Quest[];
    onStartQuest: (questId: string) => void;
    onToggleQuest: (questId: string) => void;
    onAddQuest: (quest: Omit<Quest, 'id' | 'completed'>) => void;
    onUpdateQuest: (quest: Quest) => void;
    onDeleteQuest: (questId: string) => void;
    onSuggestQuests: () => Promise<void>;
    isSuggesting: boolean;
}

// Modal for adding/editing quests
const QuestModal: React.FC<{
    quest?: Quest;
    onSave: (questData: Omit<Quest, 'id' | 'completed'> | Quest) => void;
    onClose: () => void;
}> = ({ quest, onSave, onClose }) => {
    const [title, setTitle] = useState(quest?.title || '');
    const [description, setDescription] = useState(quest?.description || '');
    const [reward, setReward] = useState(quest?.reward || 25);
    const isEditing = !!quest;

    const handleSave = () => {
        if (!title.trim() || !description.trim()) {
            alert('Please provide a title and description.');
            return;
        }
        const questData = {
            title,
            description,
            reward,
            type: quest?.type || 'generic', // Can't edit type
        };
        onSave(isEditing ? { ...questData, id: quest.id, completed: quest.completed } : questData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <QuestCard className="w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-orbitron text-yellow-300">{isEditing ? 'Edit Quest' : 'Add New Quest'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
                </div>
                <div className="space-y-4">
                    <input type="text" placeholder="Quest Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
                    <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" rows={3}></textarea>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">SP Reward</label>
                        <input type="number" value={reward} onChange={e => setReward(parseInt(e.target.value, 10) || 0)} className="w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
                    </div>
                </div>
                <div className="flex justify-end mt-6">
                    <button onClick={handleSave} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-full transition-all">
                        {isEditing ? 'Save Changes' : 'Add Quest'}
                    </button>
                </div>
            </QuestCard>
        </div>
    );
};

const QuestTracker: React.FC<QuestTrackerProps> = ({ quests, onStartQuest, onToggleQuest, onAddQuest, onUpdateQuest, onDeleteQuest, onSuggestQuests, isSuggesting }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuest, setEditingQuest] = useState<Quest | undefined>(undefined);
    
    const activeQuests = quests.filter(q => !q.completed);
    const completedQuests = quests.filter(q => q.completed);

    const handleSaveQuest = (questData: Omit<Quest, 'id' | 'completed'> | Quest) => {
        if ('id' in questData) {
            onUpdateQuest(questData);
        } else {
            onAddQuest(questData);
        }
    };
    
    const openModal = (quest?: Quest) => {
        setEditingQuest(quest);
        setIsModalOpen(true);
    };

    return (
        <div id="quests" className="space-y-6 scroll-mt-24">
            {isModalOpen && <QuestModal quest={editingQuest} onClose={() => setIsModalOpen(false)} onSave={handleSaveQuest} />}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="font-orbitron text-2xl md:text-3xl text-white flex items-center gap-3">
                    <TrophyIcon className="w-8 h-8 text-yellow-400" />
                    <span>Quests</span>
                </h2>
                <div className="flex gap-2">
                    <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-all">
                        <PlusIcon className="w-5 h-5" /> Add
                    </button>
                    <button onClick={onSuggestQuests} disabled={isSuggesting} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-all disabled:opacity-50">
                        <SparklesIcon className="w-5 h-5" /> {isSuggesting ? 'Thinking...' : 'AI Suggestions'}
                    </button>
                </div>
            </div>
            
            {activeQuests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeQuests.map(quest => (
                        <QuestCard key={quest.id} className="flex flex-col">
                            <h3 className="text-xl font-bold text-yellow-300">{quest.title}</h3>
                            <p className="text-gray-400 mt-2 flex-grow">{quest.description}</p>
                            <div className="flex justify-between items-center mt-6">
                                <div className="flex items-center gap-1 text-yellow-400 font-semibold">
                                    <StarIcon className="w-5 h-5" />
                                    <span>+{quest.reward} SP</span>
                                </div>
                                <div className="flex items-center gap-2">
                                     <button onClick={() => openModal(quest)} className="text-gray-500 hover:text-yellow-400 p-2"><PencilIcon className="w-5 h-5" /></button>
                                     <button onClick={() => window.confirm('Delete this quest?') && onDeleteQuest(quest.id)} className="text-gray-500 hover:text-red-400 p-2"><TrashIcon className="w-5 h-5" /></button>
                                    <button onClick={() => onStartQuest(quest.id)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-all">
                                        {quest.type === 'breathing' ? 'Start' : 'Complete'}
                                    </button>
                                </div>
                            </div>
                        </QuestCard>
                    ))}
                </div>
            ) : (
                <QuestCard className="text-center py-12">
                     <h3 className="text-xl font-bold text-gray-400">No active quests.</h3>
                     <p className="text-gray-500 mt-2">Add a new quest or use AI to suggest one!</p>
                </QuestCard>
            )}
            
            {completedQuests.length > 0 && (
                <div className="mt-12">
                    <h3 className="font-orbitron text-xl md:text-2xl text-gray-500 mb-4">Completed Quests</h3>
                    <div className="space-y-4">
                        {completedQuests.map(quest => (
                            <QuestCard key={quest.id} className="opacity-60 border-green-500/20">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-grow">
                                        <h4 className="text-lg font-bold text-gray-400 line-through">{quest.title}</h4>
                                        <p className="text-gray-500 mt-1">{quest.description}</p>
                                    </div>
                                    <button
                                        onClick={() => onToggleQuest(quest.id)}
                                        className="p-1 text-gray-500 hover:text-cyan-400 transition-colors flex-shrink-0"
                                        aria-label={`Mark '${quest.title}' as incomplete`}
                                        title="Mark as incomplete"
                                    >
                                        <ArrowUturnLeftIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </QuestCard>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestTracker;