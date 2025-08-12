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

export const suggestHabitsForGoals = async (goals: Goal[]): Promise<Partial<Habit>[]> => {
    if (!process.env.GEMINI_API_KEY) {
        console.error("Gemini API key is not configured.");
        return [
            { name: "Review Goals Daily", description: "Start each day by reviewing your main objectives." },
            { name: "Plan Tomorrow Today", description: "End your workday by planning the next." },
        ];
    }

    const goalDescriptions = goals.map(g => `- ${g.name}: ${g.description}`).join('\n');

    const prompt = `
Based on the following long-term goals, suggest 3-5 new daily or weekly habits that would help achieve them.
The habits should be specific, actionable, and small enough to be incorporated into a daily routine.
Avoid suggesting habits the user might already be doing. Focus on creative or supportive habits.

My Goals:
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
        
        const jsonText = response.text.trim();
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

export const suggestQuests = async (goals: Goal[], habits: Habit[]): Promise<Omit<Quest, 'id' | 'completed'>[]> => {
    if (!process.env.GEMINI_API_KEY) {
        console.error("Gemini API key is not configured.");
        return [];
    }

    const goalDescriptions = goals.map(g => `- ${g.name}`).join('\n');
    const habitDescriptions = habits.map(h => `- ${h.name}`).join('\n');

    const prompt = `
Based on the following long-term goals and daily habits, suggest 2-3 unique, one-time "quests".
A quest should be a specific, short-term challenge that pushes the user slightly beyond their routine to accelerate progress.
For example, if a goal is 'Learn a new skill', a quest could be 'Complete a 2-hour tutorial on the topic'.
Avoid suggesting things that are already listed as habits.

My Goals:
${goalDescriptions}

My Habits:
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

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        
        return result?.quests || [];

    } catch (error) {
        console.error("Error fetching or parsing quest suggestions from Gemini:", error);
        return [];
    }
};
