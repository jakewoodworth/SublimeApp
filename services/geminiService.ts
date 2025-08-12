import { GoogleGenAI, Type } from "@google/genai";
import type { Goal, Habit, Quest } from '../types';

let ai: GoogleGenAI | undefined;

if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} else {
    console.warn("GEMINI_API_KEY environment variable not set. Gemini features will be disabled.");
}

const habitSchema = {
    type: Type.OBJECT,
    properties: {
        name: {
            type: Type.STRING,
            description: "A short, actionable name for the habit (e.g., 'Meditate for 10 minutes').",
        },
        description: {
            type: Type.STRING,
            description: "A brief explanation of why this habit is beneficial for the user's goals.",
        },
    },
    required: ["name", "description"],
};

export const suggestHabitsForGoals = async (goals: Goal[], audience?: string): Promise<Partial<Habit>[]> => {
    if (!process.env.GEMINI_API_KEY) {
        console.error("Gemini API key is not configured.");
        return [
            { name: "Review Goals Daily", description: "Start each day by reviewing your main objectives." },
            { name: "Plan Tomorrow Today", description: "End your workday by planning the next." },
        ];
    }

    const goalDescriptions = goals.map(g => `- ${g.name}: ${g.description}`).join('\n');
    const target = audience?.trim() || 'the user';

    const prompt = `
Based on the following long-term goals, suggest 3-5 new daily or weekly habits that would help ${target} achieve them.
The habits should be specific, actionable, and small enough to be incorporated into a daily routine.
Avoid suggesting habits they might already be doing. Focus on creative or supportive habits.

Goals:
${goalDescriptions}

Provide the habits in the specified JSON format.
`;

    try {
        const response = await ai!.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        habits: {
                            type: Type.ARRAY,
                            items: habitSchema,
                        },
                    },
                    required: ['habits'],
                },
            },
        });

        const jsonText = (response.text || '').trim();
        if (!jsonText) {
            console.error('Empty response from Gemini');
            return [];
        }
        const result = JSON.parse(jsonText);
        
        return result?.habits || [];

    } catch (error) {
        console.error("Error fetching or parsing habit suggestions from Gemini:", error);
        return [];
    }
};

const questSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A short, engaging title for the quest (e.g., 'The 5-Minute Mind Reset').",
        },
        description: {
            type: Type.STRING,
            description: "A brief, motivating description of the quest and its purpose.",
        },
        reward: {
            type: Type.INTEGER,
            description: "An appropriate SP reward value for completing the quest, usually between 20 and 100.",
        },
        type: {
            type: Type.STRING,
            description: "The type of quest. Must be 'generic'.",
            enum: ['generic']
        }
    },
    required: ["title", "description", "reward", "type"],
};

export const suggestQuests = async (goals: Goal[], habits: Habit[], audience?: string): Promise<Omit<Quest, 'id' | 'completed'>[]> => {
    if (!process.env.GEMINI_API_KEY) {
        console.error("Gemini API key is not configured.");
        return [];
    }

    const goalDescriptions = goals.map(g => `- ${g.name}`).join('\n');
    const habitDescriptions = habits.map(h => `- ${h.name}`).join('\n');
    const target = audience?.trim() || 'the user';

    const prompt = `
Based on the following long-term goals and daily habits, suggest 2-3 unique, one-time "quests" for ${target}.
A quest should be a specific, short-term challenge that pushes them slightly beyond their routine to accelerate progress.
For example, if a goal is 'Learn a new skill', a quest could be 'Complete a 2-hour tutorial on the topic'.
Avoid suggesting things that are already listed as habits.

Goals:
${goalDescriptions}

Habits:
${habitDescriptions}

Provide the quests in the specified JSON format. The quest 'type' must be 'generic'.
`;
    try {
        const response = await ai!.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        quests: {
                            type: Type.ARRAY,
                            items: questSchema,
                        },
                    },
                    required: ['quests'],
                },
            },
        });

        const jsonText = (response.text || '').trim();
        if (!jsonText) {
            console.error('Empty response from Gemini');
            return [];
        }
        const result = JSON.parse(jsonText);
        
        return result?.quests || [];

    } catch (error) {
        console.error("Error fetching or parsing quest suggestions from Gemini:", error);
        return [];
    }
};
