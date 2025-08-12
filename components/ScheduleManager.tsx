import React, { useState, useEffect } from 'react';
import type { TimeBlock, TimeBlockType } from '../types';
import QuestCard from './QuestCard';
import { CalendarDaysIcon, PlusIcon, TrashIcon, XMarkIcon, CheckCircleIcon, StarIcon, PencilIcon } from './IconComponents';

interface ScheduleManagerProps {
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    timeBlocks: TimeBlock[];
    onAddTimeBlock: (block: Omit<TimeBlock, 'id'>) => void;
    onUpdateTimeBlock: (block: TimeBlock) => void;
    onDeleteTimeBlock: (blockId: string) => void;
    onToggleTimeBlock: (blockId: string) => void;
}

const timeToMinutes = (time: string): number => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const START_HOUR = 6;
const END_HOUR = 22;
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

const blockTypeColors: Record<TimeBlockType, { bg: string; border: string; text: string }> = {
    'deep-work': { bg: 'bg-indigo-500/30', border: 'border-indigo-400', text: 'text-indigo-200' },
    'learning': { bg: 'bg-cyan-500/30', border: 'border-cyan-400', text: 'text-cyan-200' },
    'rest': { bg: 'bg-green-500/30', border: 'border-green-400', text: 'text-green-200' },
    'planning': { bg: 'bg-gray-500/30', border: 'border-gray-400', text: 'text-gray-200' },
    'personal': { bg: 'bg-rose-500/30', border: 'border-rose-400', text: 'text-rose-200' },
};

const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

const TimeBlockModal: React.FC<{
    block: Omit<TimeBlock, 'id'> | TimeBlock;
    onSave: (block: Omit<TimeBlock, 'id'> | TimeBlock) => void;
    onClose: () => void;
    onDelete?: (id: string) => void;
}> = ({ block, onSave, onClose, onDelete }) => {
    const [editedBlock, setEditedBlock] = useState(() => structuredClone(block));
    const isEditing = 'id' in block;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editedBlock.title.trim() || !editedBlock.startTime || !editedBlock.endTime || editedBlock.startTime >= editedBlock.endTime) {
            alert('Please fill out all fields correctly. Start time must be before end time.');
            return;
        }
        onSave(editedBlock);
        onClose();
    };

    const handleDelete = () => {
        if (isEditing && onDelete && window.confirm('Are you sure you want to delete this time block?')) {
            onDelete(block.id);
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <QuestCard className="w-full max-w-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                         <h3 className="text-xl font-bold text-green-300 flex items-center gap-2">
                            {isEditing ? "Edit Time Block" : "Add Time Block"}
                        </h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="w-6 h-6"/></button>
                    </div>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                        <input type="text" id="title" value={editedBlock.title} onChange={e => setEditedBlock({...editedBlock, title: e.target.value})} className="block w-full bg-gray-900/50 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" required />
                    </div>
                        <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-gray-300 mb-1">Start Time</label>
                            <input type="time" id="startTime" value={editedBlock.startTime} onChange={e => setEditedBlock({...editedBlock, startTime: e.target.value})} className="block w-full bg-gray-900/50 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" required />
                        </div>
                        <div>
                            <label htmlFor="endTime" className="block text-sm font-medium text-gray-300 mb-1">End Time</label>
                            <input type="time" id="endTime" value={editedBlock.endTime} onChange={e => setEditedBlock({...editedBlock, endTime: e.target.value})} className="block w-full bg-gray-900/50 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                            <select id="type" value={editedBlock.type} onChange={e => setEditedBlock({...editedBlock, type: e.target.value as TimeBlockType})} className="block w-full bg-gray-900/50 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
                                <option value="deep-work">Deep Work</option>
                                <option value="learning">Learning</option>
                                <option value="rest">Rest</option>
                                <option value="planning">Planning</option>
                                <option value="personal">Personal</option>
                            </select>
                        </div>
                        <div>
                             <label htmlFor="spValue" className="block text-sm font-medium text-gray-300 mb-1">SP Value</label>
                             <input type="number" id="spValue" value={editedBlock.spValue} onChange={e => setEditedBlock({...editedBlock, spValue: parseInt(e.target.value, 10) || 0})} className="block w-full bg-gray-900/50 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" required />
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                        {isEditing && onDelete ? (
                             <button type="button" onClick={handleDelete} className="flex items-center gap-2 bg-red-600/80 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-full transition-all text-sm">
                                <TrashIcon className="w-5 h-5" /> Delete
                            </button>
                        ) : <div></div>}
                        <button type="submit" className="flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition-all">
                           {isEditing ? "Save Changes" : "Add to Schedule"}
                        </button>
                    </div>
                </form>
            </QuestCard>
        </div>
    );
};


const ScheduleManager: React.FC<ScheduleManagerProps> = ({ selectedDate, setSelectedDate, timeBlocks, onAddTimeBlock, onUpdateTimeBlock, onDeleteTimeBlock, onToggleTimeBlock }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);

    const handleDateChange = (days: number) => {
        const currentDate = new Date(selectedDate + 'T00:00:00');
        currentDate.setDate(currentDate.getDate() + days);
        setSelectedDate(currentDate.toISOString().slice(0, 10));
    };
    
    const openAddModal = () => {
        setEditingBlock(null);
        setIsModalOpen(true);
    }
    
    const openEditModal = (block: TimeBlock) => {
        setEditingBlock(block);
        setIsModalOpen(true);
    }

    const handleSave = (block: Omit<TimeBlock, 'id'> | TimeBlock) => {
        if('id' in block){
            onUpdateTimeBlock(block);
        } else {
            onAddTimeBlock(block);
        }
    }
    
    const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    
    const isToday = selectedDate === new Date().toISOString().slice(0, 10);

    return (
        <div className="space-y-6 scroll-mt-24" id="schedule">
            {isModalOpen && (
                <TimeBlockModal 
                    block={editingBlock || { title: '', startTime: '09:00', endTime: '10:00', type: 'deep-work', completed: false, spValue: 10 }}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                    onDelete={onDeleteTimeBlock}
                />
            )}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="font-orbitron text-2xl md:text-3xl text-white flex items-center gap-3">
                    <CalendarDaysIcon className="w-8 h-8" />
                    <span>Daily Schedule</span>
                </h2>
                <div className="flex items-center gap-1 bg-gray-800/50 p-1 rounded-full border border-blue-400/20 text-sm">
                     <button onClick={() => handleDateChange(-1)} className="px-3 py-1 rounded-full hover:bg-gray-700 transition">‹ Prev</button>
                     {!isToday && <button onClick={() => setSelectedDate(new Date().toISOString().slice(0,10))} className="px-3 py-1 rounded-full hover:bg-gray-700 transition text-cyan-300">Today</button>}
                     <span className="font-semibold text-center w-24 md:w-auto px-2">{isToday ? "Today" : selectedDate}</span>
                     <button onClick={() => handleDateChange(1)} className="px-3 py-1 rounded-full hover:bg-gray-700 transition">Next ›</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timeline Visualization */}
                <div className="lg:col-span-2">
                    <QuestCard className="p-0 overflow-hidden">
                        <div className="relative h-[600px] overflow-y-auto bg-gray-900/20">
                            {hours.map(hour => (
                                <div key={hour} className="flex items-start h-[calc(100%/17)] border-b border-blue-400/10">
                                    <span className="text-xs text-gray-500 pt-0.5 ml-2 pr-2 w-14 text-right">{`${hour}:00`}</span>
                                    <div className="w-full h-full border-l border-blue-400/10"></div>
                                </div>
                            ))}
                            {timeBlocks.map(block => {
                                const startMinutes = timeToMinutes(block.startTime) - START_HOUR * 60;
                                const endMinutes = timeToMinutes(block.endTime) - START_HOUR * 60;

                                if (startMinutes < 0 || endMinutes > TOTAL_MINUTES || startMinutes >= endMinutes) return null;

                                const top = (startMinutes / TOTAL_MINUTES) * 100;
                                const height = ((endMinutes - startMinutes) / TOTAL_MINUTES) * 100;
                                const colors = blockTypeColors[block.type];

                                return (
                                    <button
                                        key={block.id}
                                        onClick={() => openEditModal(block)}
                                        className={`absolute left-16 right-2 p-2 rounded-lg backdrop-blur-sm border ${colors.bg} ${colors.border} overflow-hidden text-left hover:ring-2 hover:ring-offset-2 hover:ring-offset-gray-800 hover:ring-cyan-400 transition-all ${block.completed ? 'opacity-60 border-dashed' : ''}`}
                                        style={{ top: `${top}%`, height: `max(2.5rem, ${height}%)` }}
                                        title={`${block.title} (${block.startTime} - ${block.endTime})`}
                                    >
                                        {block.completed && <CheckCircleIcon className="absolute top-1.5 right-1.5 w-5 h-5 text-green-300" />}
                                        <p className={`font-bold text-sm truncate ${colors.text}`}>{block.title}</p>
                                        <p className="text-xs text-gray-400">{`${block.startTime} - ${block.endTime}`}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </QuestCard>
                </div>

                {/* Date Info and Add Button */}
                <div className="lg:col-span-1">
                    <QuestCard className="max-h-[600px] flex flex-col">
                        <h3 className="text-xl font-bold text-green-300">{formattedDate}</h3>
                        <p className="text-gray-400 mb-4">{timeBlocks.length > 0 ? `${timeBlocks.length} blocks scheduled.` : "Your schedule is clear."}</p>
                        
                        <div className="flex-grow overflow-y-auto space-y-3 pr-2 -mr-2">
                             {timeBlocks.map(block => (
                                <div key={block.id} className={`p-3 rounded-lg flex items-center gap-3 transition-all ${block.completed ? 'bg-gray-800/50' : 'bg-gray-900/50'}`}>
                                    <button onClick={() => onToggleTimeBlock(block.id)} aria-label={`Complete ${block.title}`}>
                                        <CheckCircleIcon className={`w-7 h-7 transition-colors ${block.completed ? 'text-green-400' : 'text-gray-600 hover:text-green-400'}`} />
                                    </button>
                                    <div className="flex-grow">
                                        <p className={`font-semibold ${block.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>{block.title}</p>
                                        <p className="text-sm text-gray-400">{block.startTime} - {block.endTime}</p>
                                    </div>
                                    <div className="text-center">
                                         <div className="flex items-center gap-1 text-yellow-400 font-semibold text-sm">
                                            <StarIcon className="w-4 h-4" />
                                            <span>{block.spValue}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => openEditModal(block)} className="text-gray-500 hover:text-cyan-400 p-1">
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            {timeBlocks.length === 0 && <p className="text-gray-500 text-center py-8">No blocks for this day.</p>}
                        </div>

                        <button onClick={openAddModal} className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-full transition-all mt-4 flex-shrink-0">
                           <PlusIcon className="w-6 h-6" /> Add Time Block
                        </button>
                    </QuestCard>
                </div>
            </div>
        </div>
    );
};

export default ScheduleManager;