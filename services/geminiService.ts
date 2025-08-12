import type { Goal, Habit, Quest } from '../types';

/**
 * Request habit suggestions from the backend Gemini proxy.
 */
export const suggestHabitsForGoals = async (goals: Goal[]): Promise<Partial<Habit>[]> => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'habits', goals }),
    });
    if (!response.ok) throw new Error(`Server responded with ${response.status}`);
    const data = await response.json();
    return data.habits || [];
  } catch (error) {
    console.error('Error fetching habit suggestions from server:', error);
    return [];
  }
};

/**
 * Request quest suggestions from the backend Gemini proxy.
 */
export const suggestQuests = async (
  goals: Goal[],
  habits: Habit[],
): Promise<Omit<Quest, 'id' | 'completed'>[]> => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'quests', goals, habits }),
    });
    if (!response.ok) throw new Error(`Server responded with ${response.status}`);
    const data = await response.json();
    return data.quests || [];
  } catch (error) {
    console.error('Error fetching quest suggestions from server:', error);
    return [];
  }
};

