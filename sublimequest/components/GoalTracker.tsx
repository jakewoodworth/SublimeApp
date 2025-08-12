import React, { useState } from 'react';
import type { Goal, Milestone } from '../types';
import QuestCard from './QuestCard';
import { CheckCircleIcon, GoalIcon, PencilIcon, TrashIcon, PlusIcon, XMarkIcon } from './IconComponents';

interface GoalTrackerProps {
    id: string;
    title: string;
    themeColor: 'purple' | 'orange';
    goals: Goal[];
    onAddGoal: (goal: Omit<Goal, 'id' | 'milestones'>) => void;
    onToggleMilestone: (goalId: string, milestoneId: string) => void;
    onUpdateGoal: (goal: Goal) => void;
    onDeleteGoal: (goalId: string) => void;
}

interface GoalModalProps {
    goal?: Goal;
    onClose: () => void;
    onSave: (goal: Omit<Goal, 'id'> | Goal) => void;
    onDelete: (goalId: string) => void;
    themeColor: 'purple' | 'orange';
}

const themes = {
    purple: {
        text: 'text-purple-300',
        iconText: 'text-purple-400',
        ring: 'focus:ring-purple-500',
        border: 'focus:border-purple-500',
        bg: 'bg-purple-600',
        hoverBg: 'hover:bg-purple-700',
        gradient: 'from-purple-500 to-indigo-500'
    },
    orange: {
        text: 'text-orange-300',
        iconText: 'text-orange-400',
        ring: 'focus:ring-orange-500',
        border: 'focus:border-orange-500',
        bg: 'bg-orange-600',
        hoverBg: 'hover:bg-orange-700',
        gradient: 'from-orange-500 to-amber-500'
    }
};

const GoalModal: React.FC<GoalModalProps> = ({ goal: initialGoal, onClose, onSave, onDelete, themeColor }) => {
    const [goal, setGoal] = useState(initialGoal || { name: '', description: '', milestones: [] });
    const [newMilestoneName, setNewMilestoneName] = useState("");
    const isEditing = !!initialGoal;
    const theme = themes[themeColor];

    const handleSave = () => {
        if (isEditing) {
            onSave(goal as Goal);
        } else {
            onSave(goal);
        }
        onClose();
    }
    
    const handleDeleteGoal = () => {
        if(isEditing && window.confirm(`Are you sure you want to delete the goal "${goal.name}" and all its milestones?`)){
            onDelete((goal as Goal).id);
            onClose();
        }
    }

    const handleMilestoneChange = (id: string, name: string) => {
        setGoal(prev => ({...prev, milestones: prev.milestones.map(m => m.id === id ? {...m, name} : m)}));
    }

    const handleAddMilestone = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newMilestoneName.trim() || !isEditing) return;
        const newMilestone: Milestone = { id: `m-${Date.now()}`, name: newMilestoneName, completed: false };
        setGoal(prev => ({ ...prev, milestones: [...prev.milestones, newMilestone] }));
        setNewMilestoneName("");
    }
    
    const handleDeleteMilestone = (id: string) => {
        setGoal(prev => ({...prev, milestones: prev.milestones.filter(m => m.id !== id)}));
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <QuestCard className="w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-2xl font-orbitron ${theme.text}`}>{isEditing ? 'Edit Goal' : 'Add Goal'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Goal Name</label>
                        <input type="text" value={goal.name} onChange={e => setGoal({...goal, name: e.target.value})} className={`block w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none ${theme.ring} ${theme.border}`} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea value={goal.description} onChange={e => setGoal({...goal, description: e.target.value})} className={`block w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none ${theme.ring} ${theme.border}`} rows={3}></textarea>
                    </div>
                    {isEditing && (
                        <div>
                            <h4 className="text-lg font-semibold text-gray-300 mb-2">Milestones</h4>
                            <div className="space-y-2">
                                {(goal.milestones || []).map(m => (
                                    <div key={m.id} className="flex items-center gap-2">
                                        <input type="text" value={m.name} onChange={(e) => handleMilestoneChange(m.id, e.target.value)} className="flex-grow bg-gray-700/50 border border-gray-600 rounded-md py-1 px-2 text-white" />
                                        <button onClick={() => handleDeleteMilestone(m.id)} className="p-1 text-gray-500 hover:text-red-400"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleAddMilestone} className="flex items-center gap-2 mt-3">
                                <input type="text" value={newMilestoneName} onChange={e => setNewMilestoneName(e.target.value)} placeholder="New milestone name..." className="flex-grow bg-gray-900/50 border border-gray-600 rounded-md py-1 px-2 text-white" />
                                <button type="submit" className={`p-2 ${theme.bg} rounded-md text-white ${theme.hoverBg}`}><PlusIcon className="w-5 h-5"/></button>
                            </form>
                        </div>
                    )}
                </div>
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
                    {isEditing ? (
                        <button onClick={handleDeleteGoal} className="flex items-center gap-2 bg-red-600/80 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-all">
                            <TrashIcon className="w-5 h-5" /> Delete Goal
                        </button>
                    ) : (
                        <div></div>
                    )}
                    <button onClick={handleSave} className={`${theme.bg} ${theme.hoverBg} text-white font-bold py-2 px-4 rounded-full transition-all`}>
                        {isEditing ? 'Save Changes' : 'Add Goal'}
                    </button>
                </div>
            </QuestCard>
        </div>
    );
}


const GoalTracker: React.FC<GoalTrackerProps> = ({ id, title, themeColor, goals, onAddGoal, onToggleMilestone, onUpdateGoal, onDeleteGoal }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
    
    const theme = themes[themeColor];

    const calculateProgress = (goal: Goal) => {
        if (goal.milestones.length === 0) return 0;
        const completedCount = goal.milestones.filter(m => m.completed).length;
        return (completedCount / goal.milestones.length) * 100;
    };

    const openModal = (goal?: Goal) => {
        setEditingGoal(goal);
        setIsModalOpen(true);
    };

    const handleSaveGoal = (goalData: Omit<Goal, 'id'> | Goal) => {
        if ('id' in goalData) {
            onUpdateGoal(goalData);
        } else {
            onAddGoal(goalData as Omit<Goal, 'id' | 'milestones'>);
        }
    };

    return (
        <div id={id} className="space-y-6 scroll-mt-24">
             {isModalOpen && (
                <GoalModal
                    goal={editingGoal}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveGoal}
                    onDelete={onDeleteGoal}
                    themeColor={themeColor}
                />
            )}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="font-orbitron text-2xl md:text-3xl text-white">{title}</h2>
                <button
                    onClick={() => openModal()}
                    className={`flex items-center gap-2 ${theme.bg} ${theme.hoverBg} text-white font-bold py-2 px-4 rounded-full transition-all duration-300`}
                >
                    <PlusIcon className="w-5 h-5" /> Add Goal
                </button>
            </div>
            <div className="space-y-8">
                {goals.map((goal) => (
                    <QuestCard key={goal.id}>
                        <div className="flex items-start gap-4 mb-4">
                            <GoalIcon className={`w-8 h-8 ${theme.iconText} mt-1 flex-shrink-0`} />
                            <div className="flex-grow">
                                <h3 className={`text-2xl font-bold ${theme.text}`}>{goal.name}</h3>
                                <p className="text-gray-400 mt-1">{goal.description}</p>
                            </div>
                            <div className="flex-shrink-0 flex gap-2">
                                <button onClick={() => openModal(goal)} className={`text-gray-500 hover:${theme.text} transition-colors`}>
                                    <PencilIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>

                        <div className="w-full bg-gray-700 rounded-full h-2.5 my-4">
                            <div 
                                className={`bg-gradient-to-r ${theme.gradient} h-2.5 rounded-full transition-all duration-500`} 
                                style={{width: `${calculateProgress(goal)}%`}}>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-semibold text-gray-300">Milestones:</h4>
                            {goal.milestones.map((milestone) => (
                                <div key={milestone.id} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg">
                                    <span className={`transition-colors ${milestone.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                        {milestone.name}
                                    </span>
                                    <button onClick={() => onToggleMilestone(goal.id, milestone.id)}>
                                        <CheckCircleIcon className={`w-6 h-6 transition-colors ${milestone.completed ? 'text-green-400' : 'text-gray-600 hover:text-green-400'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </QuestCard>
                ))}
            </div>
             {goals.length === 0 && (
                <QuestCard className="text-center py-12">
                     <h3 className="text-xl font-bold text-gray-400">No goals here yet.</h3>
                     <p className="text-gray-500 mt-2">Click "Add Goal" to create one!</p>
                </QuestCard>
            )}
        </div>
    );
};

export default GoalTracker;