import React, { useState } from 'react';
import type { Habit } from '../types';
import QuestCard from './QuestCard';
import { CheckCircleIcon, SparklesIcon, StarIcon, PencilIcon, TrashIcon, XMarkIcon, PlusIcon } from './IconComponents';

interface HabitTrackerProps {
    habits: Habit[];
    onToggleHabit: (habitId: string) => void;
    onAddHabit: (habit: Omit<Habit, 'id' | 'streak' | 'completedOn'>) => void;
    onUpdateHabit: (habit: Habit) => void;
    onDeleteHabit: (habitId: string) => void;
    onSuggestHabits: () => Promise<void>;
    isSuggesting: boolean;
    today: string;
}

interface HabitModalProps {
    habit?: Habit;
    onClose: () => void;
    onSave: (habit: Omit<Habit, 'id' | 'streak' | 'completedOn'> | Habit) => void;
    onDelete: (habitId: string) => void;
}

const HabitModal: React.FC<HabitModalProps> = ({ habit, onClose, onSave, onDelete }) => {
    const [editedHabit, setEditedHabit] = useState({
        name: habit?.name || '',
        description: habit?.description || '',
        spValue: habit?.spValue || 10,
    });
    const isEditing = !!habit;

    const handleSave = () => {
        if (isEditing) {
            onSave({ ...habit, ...editedHabit });
        } else {
            onSave(editedHabit);
        }
        onClose();
    }
    
    const handleDelete = () => {
        if(isEditing && window.confirm(`Are you sure you want to delete the habit "${habit.name}"? This cannot be undone.`)){
            onDelete(habit.id);
            onClose();
        }
    }
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <QuestCard className="w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-orbitron text-cyan-300">{isEditing ? 'Edit Habit' : 'Add Habit'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                        <input type="text" value={editedHabit.name} onChange={e => setEditedHabit({...editedHabit, name: e.target.value})} className="block w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea value={editedHabit.description} onChange={e => setEditedHabit({...editedHabit, description: e.target.value})} className="block w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" rows={3}></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">SP Value</label>
                        <input type="number" value={editedHabit.spValue} onChange={e => setEditedHabit({...editedHabit, spValue: parseInt(e.target.value, 10) || 0})} className="block w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                </div>
                <div className="flex justify-between items-center mt-6">
                    {isEditing ? (
                        <button onClick={handleDelete} className="flex items-center gap-2 bg-red-600/80 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-all">
                            <TrashIcon className="w-5 h-5" /> Delete
                        </button>
                    ) : (
                        <div></div>
                    )}
                    <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-full transition-all">
                        {isEditing ? 'Save Changes' : 'Add Habit'}
                    </button>
                </div>
            </QuestCard>
        </div>
    )
}


const HabitTracker: React.FC<HabitTrackerProps> = ({ habits, onToggleHabit, onAddHabit, onUpdateHabit, onDeleteHabit, onSuggestHabits, isSuggesting, today }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);

    const openModal = (habit?: Habit) => {
        setEditingHabit(habit);
        setIsModalOpen(true);
    };

    const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'streak' | 'completedOn'> | Habit) => {
        if ('id' in habitData) {
            onUpdateHabit(habitData);
        } else {
            onAddHabit(habitData);
        }
    };

    return (
        <div id="habits" className="space-y-6 scroll-mt-24">
            {isModalOpen && (
                <HabitModal
                    habit={editingHabit} 
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveHabit}
                    onDelete={onDeleteHabit}
                />
            )}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="font-orbitron text-2xl md:text-3xl text-white">Daily Habits</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-300"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add Habit
                    </button>
                    <button
                        onClick={onSuggestHabits}
                        disabled={isSuggesting}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        {isSuggesting ? 'Thinking...' : 'AI Suggestions'}
                    </button>
                </div>
            </div>
            {habits.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {habits.map((habit) => {
                        const isCompletedToday = habit.completedOn.includes(today);
                        return (
                            <QuestCard key={habit.id} className="flex flex-col">
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-bold text-cyan-300 pr-2">{habit.name}</h3>
                                        <div className="flex-shrink-0 flex gap-2">
                                            <button onClick={() => openModal(habit)} className="text-gray-500 hover:text-cyan-400 transition-colors">
                                                <PencilIcon className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 mt-2 text-sm">{habit.description}</p>
                                </div>
                                <div className="flex justify-between items-center mt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 text-yellow-400 font-semibold">
                                            <StarIcon className="w-5 h-5" />
                                            <span>{habit.spValue} SP</span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Streak: {habit.streak}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onToggleHabit(habit.id)}
                                        className={`p-2 rounded-full transition-all duration-200 ${isCompletedToday ? 'bg-green-500/80 text-white' : 'bg-green-500/20 hover:bg-green-500/40 text-green-300'}`}
                                        aria-label={isCompletedToday ? `Uncomplete ${habit.name}` : `Complete ${habit.name}`}
                                    >
                                        <CheckCircleIcon className="w-8 h-8"/>
                                    </button>
                                </div>
                            </QuestCard>
                        )
                    })}
                </div>
            ) : (
                <QuestCard className="text-center py-12">
                     <h3 className="text-xl font-bold text-gray-400">No habits yet.</h3>
                     <p className="text-gray-500 mt-2">Click "Add Habit" or "AI Suggestions" to get started!</p>
                </QuestCard>
            )}
        </div>
    );
};

export default HabitTracker;