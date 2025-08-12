import React, { useState, useCallback, useEffect } from 'react';
import type { Avatar, Goal, Habit, Milestone, TimeBlock, Quest } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import HabitTracker from './components/HabitTracker';
import GoalTracker from './components/GoalTracker';
import ScheduleManager from './components/ScheduleManager';
import QuestTracker from './components/QuestTracker';
import BreathingExercise from './components/BreathingExercise';
import { suggestHabitsForGoals, suggestQuests } from './services/geminiService';
import { useLocalStorage } from './hooks/useLocalStorage';

// --- Helpers ---
const getTodayString = () => new Date().toISOString().slice(0, 10);

// --- Initial Data ---
const INITIAL_AVATAR: Avatar = {
    level: 1,
    currentXP: 0,
    xpToNextLevel: 100,
};

const INITIAL_HABITS: Habit[] = [
    { id: 'h1', name: 'Meditate 10 mins', description: 'Find clarity and focus for the day.', spValue: 10, streak: 3, completedOn: [] },
    { id: 'h2', name: 'Read AI Research', description: 'Stay on top of the latest trends in AI.', spValue: 20, streak: 7, completedOn: [] },
    { id: 'h3', name: 'Write Business Ideas', description: 'Cultivate creativity and find new opportunities.', spValue: 15, streak: 1, completedOn: [] },
];

const INITIAL_GOALS: Goal[] = [
    {
        id: 'g1',
        name: 'Prototype AI for Airports Solution',
        description: 'Develop a working prototype for an innovative airport AI system.',
        milestones: [
            { id: 'm1', name: 'Brainstorm 5 core ideas', completed: true },
            { id: 'm2', name: 'Outline prototype features', completed: false },
            { id: 'm3', name: 'Develop proof-of-concept', completed: false },
        ],
    },
];

const INITIAL_SHORT_TERM_GOALS: Goal[] = [
    {
        id: 'sg1',
        name: 'Finalize Q3 Project Plan',
        description: 'Outline all tasks, assign resources, and set deadlines for the upcoming quarter.',
        milestones: [
            { id: 'sm1', name: 'Draft initial task list', completed: true },
            { id: 'sm2', name: 'Get feedback from team leads', completed: false },
            { id: 'sm3', name: 'Publish final plan', completed: false },
        ],
    },
];

const INITIAL_TIME_BLOCKS: Record<string, TimeBlock[]> = {
    [getTodayString()]: [
        { id: 'tb1', title: 'Deep Work: AI Prototype', startTime: '09:00', endTime: '11:30', type: 'deep-work', completed: false, spValue: 25 },
        { id: 'tb2', title: 'Read AI Research', startTime: '12:00', endTime: '13:00', type: 'learning', completed: true, spValue: 15 },
    ]
};

const INITIAL_QUESTS: Quest[] = [
    { 
        id: 'q1',
        title: 'Recovery Quest: Quick Reset',
        description: 'Feeling off track? Complete a 5-minute breathing exercise to regain focus and protect your streaks.',
        reward: 25,
        completed: false,
        type: 'breathing',
    },
    { 
        id: 'q2',
        title: 'Planning Blitz',
        description: 'Spend 15 uninterrupted minutes planning your next big project milestone.',
        reward: 30,
        completed: false,
        type: 'generic',
    },
];


const App: React.FC = () => {
    const [avatar, setAvatar] = useLocalStorage<Avatar>('sublime_avatar', INITIAL_AVATAR);
    const [sublimePoints, setSublimePoints] = useLocalStorage<number>('sublime_points', 50);
    const [habits, setHabits] = useLocalStorage<Habit[]>('sublime_habits', INITIAL_HABITS);
    const [goals, setGoals] = useLocalStorage<Goal[]>('sublime_goals', INITIAL_GOALS);
    const [shortTermGoals, setShortTermGoals] = useLocalStorage<Goal[]>('sublime_short_term_goals', INITIAL_SHORT_TERM_GOALS);
    const [timeBlocksByDate, setTimeBlocksByDate] = useLocalStorage<Record<string, TimeBlock[]>>('sublime_schedules', INITIAL_TIME_BLOCKS);
    const [quests, setQuests] = useLocalStorage<Quest[]>('sublime_quests', INITIAL_QUESTS);
    
    const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
    const [isSuggestingHabits, setIsSuggestingHabits] = useState<boolean>(false);
    const [isSuggestingQuests, setIsSuggestingQuests] = useState<boolean>(false);
    const [activeQuestId, setActiveQuestId] = useState<string | null>(null);

    // --- Experience & Leveling ---
    const addExperience = useCallback((xp: number) => {
        setAvatar(prev => {
            let newXP = prev.currentXP + xp;
            let newLevel = prev.level;
            let xpToNext = prev.xpToNextLevel;

            while (newXP >= xpToNext) {
                newXP -= xpToNext;
                newLevel++;
                xpToNext = Math.floor(xpToNext * 1.5); // Increase XP requirement for next level
            }
            
            return {
                level: newLevel,
                currentXP: Math.max(0, newXP),
                xpToNextLevel: xpToNext,
            };
        });
    }, [setAvatar]);
    
    // --- Habit Handlers ---
    const handleToggleHabit = useCallback((habitId: string, date: string) => {
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;

        const isCompleted = habit.completedOn.includes(date);
        const spChange = isCompleted ? -habit.spValue : habit.spValue;
        const xpChange = isCompleted ? -habit.spValue : habit.spValue;
        const streakChange = isCompleted ? -1 : 1;

        setSublimePoints(sp => sp + spChange);
        addExperience(xpChange);

        setHabits(prevHabits =>
            prevHabits.map(h => {
                if (h.id === habitId) {
                    const newCompletedOn = isCompleted
                        ? h.completedOn.filter(d => d !== date)
                        : [...h.completedOn, date];
                    return { ...h, completedOn: newCompletedOn, streak: Math.max(0, h.streak + streakChange) };
                }
                return h;
            })
        );
    }, [habits, setHabits, setSublimePoints, addExperience]);
    
    const handleAddHabit = useCallback((habitData: Omit<Habit, 'id' | 'streak' | 'completedOn'>) => {
        const newHabit: Habit = {
            id: `h-${Date.now()}`,
            ...habitData,
            streak: 0,
            completedOn: [],
        };
        setHabits(prev => [newHabit, ...prev]);
    }, [setHabits]);

    const handleUpdateHabit = useCallback((updatedHabit: Habit) => {
        setHabits(prev => prev.map(h => h.id === updatedHabit.id ? updatedHabit : h));
    }, [setHabits]);

    const handleDeleteHabit = useCallback((habitId: string) => {
        setHabits(prev => prev.filter(h => h.id !== habitId));
    }, [setHabits]);


    // --- Long-Term Goal Handlers ---
    const handleAddGoal = useCallback((goalData: Omit<Goal, 'id' | 'milestones'>) => {
        const newGoal: Goal = {
            id: `g-${Date.now()}`,
            ...goalData,
            milestones: [],
        };
        setGoals(prev => [newGoal, ...prev]);
    }, [setGoals]);

    const handleToggleMilestone = useCallback((goalId: string, milestoneId: string) => {
        setGoals(prevGoals =>
            prevGoals.map(goal => {
                if (goal.id === goalId) {
                    const milestone = goal.milestones.find(m => m.id === milestoneId);
                    const isNowCompleted = milestone ? !milestone.completed : false;

                    if (milestone) {
                        const spChange = isNowCompleted ? 50 : -50;
                        const xpChange = isNowCompleted ? 25 : -25;
                        setSublimePoints(sp => Math.max(0, sp + spChange));
                        addExperience(xpChange);
                    }
                    
                    const newMilestones = goal.milestones.map(m =>
                        m.id === milestoneId ? { ...m, completed: !m.completed } : m
                    );
                    return { ...goal, milestones: newMilestones };
                }
                return goal;
            })
        );
    }, [setGoals, setSublimePoints, addExperience]);

    const handleUpdateGoal = useCallback((updatedGoal: Goal) => {
        setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    }, [setGoals]);

    const handleDeleteGoal = useCallback((goalId: string) => {
        setGoals(prev => prev.filter(g => g.id !== goalId));
    }, [setGoals]);

    // --- Short-Term Goal Handlers ---
    const handleAddShortTermGoal = useCallback((goalData: Omit<Goal, 'id' | 'milestones'>) => {
        const newGoal: Goal = {
            id: `sg-${Date.now()}`,
            ...goalData,
            milestones: [],
        };
        setShortTermGoals(prev => [newGoal, ...prev]);
    }, [setShortTermGoals]);

    const handleToggleShortTermMilestone = useCallback((goalId: string, milestoneId: string) => {
        setShortTermGoals(prevGoals =>
            prevGoals.map(goal => {
                if (goal.id === goalId) {
                    const milestone = goal.milestones.find(m => m.id === milestoneId);
                    const isNowCompleted = milestone ? !milestone.completed : false;

                    if (milestone) {
                        const spChange = isNowCompleted ? 30 : -30;
                        const xpChange = isNowCompleted ? 15 : -15;
                        setSublimePoints(sp => Math.max(0, sp + spChange));
                        addExperience(xpChange);
                    }
                    
                    const newMilestones = goal.milestones.map(m =>
                        m.id === milestoneId ? { ...m, completed: !m.completed } : m
                    );
                    return { ...goal, milestones: newMilestones };
                }
                return goal;
            })
        );
    }, [setShortTermGoals, setSublimePoints, addExperience]);

    const handleUpdateShortTermGoal = useCallback((updatedGoal: Goal) => {
        setShortTermGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    }, [setShortTermGoals]);

    const handleDeleteShortTermGoal = useCallback((goalId: string) => {
        setShortTermGoals(prev => prev.filter(g => g.id !== goalId));
    }, [setShortTermGoals]);


    // --- Schedule Handlers ---
    const handleAddTimeBlock = useCallback((date: string, block: Omit<TimeBlock, 'id'>) => {
        const newBlock: TimeBlock = { id: `tb-${Date.now()}`, ...block };
        setTimeBlocksByDate(prev => {
            const dayBlocks = prev[date] || [];
            return {
                ...prev,
                [date]: [...dayBlocks, newBlock].sort((a, b) => a.startTime.localeCompare(b.startTime))
            };
        });
    }, [setTimeBlocksByDate]);

    const handleUpdateTimeBlock = useCallback((date: string, updatedBlock: TimeBlock) => {
        setTimeBlocksByDate(prev => ({
            ...prev,
            [date]: (prev[date] || []).map(b => b.id === updatedBlock.id ? updatedBlock : b).sort((a, b) => a.startTime.localeCompare(b.startTime))
        }));
    }, [setTimeBlocksByDate]);

    const handleDeleteTimeBlock = useCallback((date: string, blockId: string) => {
        setTimeBlocksByDate(prev => ({
            ...prev,
            [date]: (prev[date] || []).filter(b => b.id !== blockId)
        }));
    }, [setTimeBlocksByDate]);

    const handleToggleTimeBlock = useCallback((date: string, blockId: string) => {
        let block: TimeBlock | undefined;
        
        setTimeBlocksByDate(prev => {
            const newTimeBlocksByDate = { ...prev };
            const dayBlocks = newTimeBlocksByDate[date] || [];
            newTimeBlocksByDate[date] = dayBlocks.map(b => {
                if (b.id === blockId) {
                    block = b;
                    return { ...b, completed: !b.completed };
                }
                return b;
            });
            return newTimeBlocksByDate;
        });

        if (!block) return;

        const isNowCompleted = !block.completed;
        const spChange = isNowCompleted ? block.spValue : -block.spValue;
        const xpChange = isNowCompleted ? block.spValue : -block.spValue;

        setSublimePoints(sp => sp + spChange);
        addExperience(xpChange);
    }, [setTimeBlocksByDate, setSublimePoints, addExperience]);

    // --- Quest Handlers ---
    const handleToggleQuest = useCallback((questId: string) => {
        const quest = quests.find(q => q.id === questId);
        if (!quest) return;

        const isNowCompleted = !quest.completed;
        const rewardChange = isNowCompleted ? quest.reward : -quest.reward;

        setQuests(prev => prev.map(q => q.id === questId ? { ...q, completed: isNowCompleted } : q));
        setSublimePoints(sp => Math.max(0, sp + rewardChange));
        addExperience(rewardChange);
        
        if (isNowCompleted && activeQuestId === questId) {
            setActiveQuestId(null);
        }
    }, [quests, setQuests, setSublimePoints, addExperience, activeQuestId]);
    
    const handleStartQuest = useCallback((questId: string) => {
        const quest = quests.find(q => q.id === questId);
        if (!quest || quest.completed) return;
        // For generic quests, just complete them instantly.
        if (quest.type === 'generic') {
            handleToggleQuest(questId);
        } else {
            setActiveQuestId(questId);
        }
    }, [quests, handleToggleQuest, setActiveQuestId]);

    const handleAddQuest = useCallback((questData: Omit<Quest, 'id' | 'completed'>) => {
        const newQuest: Quest = {
            id: `q-${Date.now()}`,
            ...questData,
            completed: false,
        };
        setQuests(prev => [newQuest, ...prev]);
    }, [setQuests]);

    const handleUpdateQuest = useCallback((updatedQuest: Quest) => {
        setQuests(prev => prev.map(q => q.id === updatedQuest.id ? updatedQuest : q));
    }, [setQuests]);
    
    const handleDeleteQuest = useCallback((questId: string) => {
        setQuests(prev => prev.filter(q => q.id !== questId));
    }, [setQuests]);

    // --- AI Suggestions ---
    const handleSuggestHabits = async () => {
        setIsSuggestingHabits(true);
        try {
            const suggested = await suggestHabitsForGoals(goals);
            const newHabits: Habit[] = suggested.map((s, index) => ({
                id: `suggested-h-${Date.now()}-${index}`,
                name: s.name || 'New Habit',
                description: s.description || 'A helpful new habit.',
                spValue: 15,
                streak: 0,
                completedOn: [],
            }));
            setHabits(prev => [...prev, ...newHabits]);
        } catch (error) {
            console.error("Failed to get habit suggestions:", error);
        } finally {
            setIsSuggestingHabits(false);
        }
    };
    
    const handleSuggestQuests = async () => {
        setIsSuggestingQuests(true);
        try {
            const suggested = await suggestQuests(goals, habits);
            const newQuests: Quest[] = suggested.map((q, index) => ({
                id: `q-${Date.now()}-${index}`,
                ...q,
                completed: false,
            }));
            setQuests(prev => [...prev, ...newQuests]);
        } catch (error) {
            console.error("Failed to get quest suggestions:", error);
        } finally {
            setIsSuggestingQuests(false);
        }
    };
    
    // --- Background Animation ---
    useEffect(() => {
        const existingContainer = document.getElementById('star-container');
        if (existingContainer) return;

        const createStar = () => {
            const star = document.createElement('div');
            star.className = 'star';
            const size = Math.random() * 2 + 1;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 5}s`;
            star.style.animationDuration = `${Math.random() * 5 + 5}s`;
            document.getElementById('star-container')?.appendChild(star);
        }
        
        const starContainer = document.createElement('div');
        starContainer.id = 'star-container';
        starContainer.style.position = 'fixed';
        starContainer.style.top = '0';
        starContainer.style.left = '0';
        starContainer.style.width = '100vw';
        starContainer.style.height = '100vh';
        starContainer.style.zIndex = '-1';
        starContainer.style.overflow = 'hidden';
        document.body.prepend(starContainer);

        const style = document.createElement('style');
        style.innerHTML = `
            .star {
                position: absolute;
                background-color: white;
                border-radius: 50%;
                opacity: 0;
                animation: twinkle linear infinite;
            }
            @keyframes twinkle {
                0% { opacity: 0; transform: scale(0.5) translateY(0); }
                25% { opacity: 1; transform: scale(1) }
                50% { opacity: 0; transform: scale(0.5) translateY(-50px); }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        for(let i = 0; i < 100; i++) { createStar(); }

        return () => {
            style.remove();
            starContainer.remove();
        };
    }, []);

    const activeQuest = quests.find(q => q.id === activeQuestId);

    return (
        <div className="min-h-screen bg-gray-900 bg-opacity-80">
            {activeQuest?.type === 'breathing' && (
                <BreathingExercise 
                    quest={activeQuest}
                    onComplete={handleToggleQuest}
                    onClose={() => setActiveQuestId(null)}
                />
            )}
            <Header sublimePoints={sublimePoints} />
            <main className="p-4 md:p-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                   <Dashboard avatar={avatar} />
                </div>
                
                <section id="habits" className="mb-12">
                   <HabitTracker 
                        habits={habits}
                        onToggleHabit={(habitId) => handleToggleHabit(habitId, getTodayString())}
                        onAddHabit={handleAddHabit}
                        onUpdateHabit={handleUpdateHabit}
                        onDeleteHabit={handleDeleteHabit}
                        onSuggestHabits={handleSuggestHabits}
                        isSuggesting={isSuggestingHabits}
                        today={getTodayString()}
                    />
                </section>
                
                <section id="goals" className="mb-12">
                   <GoalTracker
                        id="goals"
                        title="Long-Term Goals"
                        themeColor="purple"
                        goals={goals} 
                        onAddGoal={handleAddGoal}
                        onToggleMilestone={handleToggleMilestone}
                        onUpdateGoal={handleUpdateGoal}
                        onDeleteGoal={handleDeleteGoal}
                    />
                </section>

                <section id="short-term-goals" className="mb-12">
                   <GoalTracker
                        id="short-term-goals"
                        title="Short-Term Goals"
                        themeColor="orange"
                        goals={shortTermGoals} 
                        onAddGoal={handleAddShortTermGoal}
                        onToggleMilestone={handleToggleShortTermMilestone}
                        onUpdateGoal={handleUpdateShortTermGoal}
                        onDeleteGoal={handleDeleteShortTermGoal}
                    />
                </section>
                
                <section id="schedule" className="mb-12">
                   <ScheduleManager 
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        timeBlocks={timeBlocksByDate[selectedDate] || []} 
                        onAddTimeBlock={(block) => handleAddTimeBlock(selectedDate, block)}
                        onUpdateTimeBlock={(block) => handleUpdateTimeBlock(selectedDate, block)}
                        onDeleteTimeBlock={(blockId) => handleDeleteTimeBlock(selectedDate, blockId)}
                        onToggleTimeBlock={(blockId) => handleToggleTimeBlock(selectedDate, blockId)}
                    />
                </section>
                
                <section id="quests" className="mb-12">
                    <QuestTracker
                        quests={quests}
                        onStartQuest={handleStartQuest}
                        onToggleQuest={handleToggleQuest}
                        onAddQuest={handleAddQuest}
                        onUpdateQuest={handleUpdateQuest}
                        onDeleteQuest={handleDeleteQuest}
                        onSuggestQuests={handleSuggestQuests}
                        isSuggesting={isSuggestingQuests}
                    />
                </section>
            </main>
        </div>
    );
};

export default App;