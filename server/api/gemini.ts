import { GoogleGenAI, Type } from '@google/genai';
import type { Goal, Habit } from '../../types';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY environment variable not set. Gemini features will be disabled.');
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const habitSchema = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "A short, actionable name for the habit (e.g., 'Meditate for 10 minutes').",
    },
    description: {
      type: Type.STRING,
      description: 'A brief explanation of why this habit is beneficial for the user\'s goals.',
    },
  },
  required: ['name', 'description'],
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
      description: 'A brief, motivating description of the quest and its purpose.',
    },
    reward: {
      type: Type.INTEGER,
      description: 'An appropriate SP reward value for completing the quest, usually between 20 and 100.',
    },
    type: {
      type: Type.STRING,
      description: "The type of quest. Must be 'generic'.",
      enum: ['generic'],
    },
  },
  required: ['title', 'description', 'reward', 'type'],
};

export default async function handler(req: any, res: any) {
  if (req.method && req.method !== 'POST') {
    res.status?.(405).json?.({ error: 'Method not allowed' });
    return;
  }

  if (!ai) {
    res.status?.(500).json?.({ error: 'Gemini API key is not configured.' });
    return;
  }

  const body = req.body || (await getRequestBody(req));
  const { type, goals, habits } = body as {
    type: 'habits' | 'quests';
    goals: Goal[];
    habits?: Habit[];
  };

  try {
    if (type === 'habits') {
      const goalDescriptions = goals.map((g) => `- ${g.name}: ${g.description}`).join('\n');
      const prompt = `
Based on the following long-term goals, suggest 3-5 new daily or weekly habits that would help achieve them.
The habits should be specific, actionable, and small enough to be incorporated into a daily routine.
Avoid suggesting habits the user might already be doing. Focus on creative or supportive habits.

My Goals:
${goalDescriptions}

Provide the habits in the specified JSON format.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
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
      res.status?.(200).json?.({ habits: result?.habits || [] });
      return;
    }

    if (type === 'quests') {
      const goalDescriptions = goals.map((g) => `- ${g.name}`).join('\n');
      const habitDescriptions = (habits || []).map((h) => `- ${h.name}`).join('\n');
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

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
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
      res.status?.(200).json?.({ quests: result?.quests || [] });
      return;
    }

    res.status?.(400).json?.({ error: 'Invalid request type' });
  } catch (error: any) {
    res.status?.(500).json?.({ error: 'Error fetching suggestions from Gemini', details: String(error) });
  }
}

async function getRequestBody(req: any) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on?.('data', (chunk: string) => {
      data += chunk;
    });
    req.on?.('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch (e) {
        reject(e);
      }
    });
    req.on?.('error', reject);
  });
}

