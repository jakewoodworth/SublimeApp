export interface Habit {
  id: string;
  name: string;
  description: string;
  spValue: number;
  streak: number;
  completedOn: string[]; // Tracks 'YYYY-MM-DD' dates when the habit was completed
}

export interface Milestone {
  id: string;
  name: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  milestones: Milestone[];
}

export interface Avatar {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
}

export interface Quest {
  id:string;
  title: string;
  description: string;
  reward: number; // SP reward
  completed: boolean;
  type: 'breathing' | 'generic';
}

export type TimeBlockType = 'deep-work' | 'learning' | 'rest' | 'planning' | 'personal';

export interface TimeBlock {
  id: string;
  title: string;
  startTime: string; // "HH:mm" format
  endTime: string; // "HH:mm" format
  type: TimeBlockType;
  completed: boolean;
  spValue: number;
}