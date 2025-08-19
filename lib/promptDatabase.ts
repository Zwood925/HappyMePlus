export interface PromptData {
  id: string;
  text: string;
  category: 'gratitude' | 'connection' | 'growth' | 'wonder' | 'kindness';
  tags: string[];
}

// Curated daily prompts database
export const DAILY_PROMPTS: PromptData[] = [
  // Gratitude & Joy
  {
    id: 'gratitude-1',
    text: "What made you smile today?",
    category: 'gratitude',
    tags: ['joy', 'happiness', 'smile']
  },
  {
    id: 'gratitude-2',
    text: "What's something you're grateful for right now?",
    category: 'gratitude',
    tags: ['gratitude', 'appreciation', 'blessings']
  },
  {
    id: 'gratitude-3',
    text: "Describe a small win that brightened your day",
    category: 'gratitude',
    tags: ['achievement', 'success', 'brightness']
  },

  // Connection & Community
  {
    id: 'connection-1',
    text: "Who made a positive impact on your life recently?",
    category: 'connection',
    tags: ['people', 'impact', 'relationships']
  },
  {
    id: 'connection-2',
    text: "Share something that made you laugh today",
    category: 'connection',
    tags: ['laughter', 'humor', 'fun']
  },
  {
    id: 'connection-3',
    text: "What's a beautiful moment you experienced this week?",
    category: 'connection',
    tags: ['beauty', 'moments', 'experience']
  },

  // Growth & Positivity
  {
    id: 'growth-1',
    text: "What's something you're looking forward to?",
    category: 'growth',
    tags: ['future', 'excitement', 'anticipation']
  },
  {
    id: 'growth-2',
    text: "Share a challenge you overcame recently",
    category: 'growth',
    tags: ['resilience', 'strength', 'overcoming']
  },
  {
    id: 'growth-3',
    text: "What's a simple pleasure that brings you joy?",
    category: 'growth',
    tags: ['simple', 'pleasure', 'joy']
  },

  // Wonder & Beauty
  {
    id: 'wonder-1',
    text: "What's something beautiful you noticed today?",
    category: 'wonder',
    tags: ['beauty', 'observation', 'awareness']
  },
  {
    id: 'wonder-2',
    text: "Share a moment that reminded you of the good in the world",
    category: 'wonder',
    tags: ['goodness', 'hope', 'world']
  },
  {
    id: 'wonder-3',
    text: "What's something that made you feel inspired?",
    category: 'wonder',
    tags: ['inspiration', 'motivation', 'creativity']
  },

  // Kindness & Compassion
  {
    id: 'kindness-1',
    text: "Share a moment of kindness you witnessed or received",
    category: 'kindness',
    tags: ['kindness', 'compassion', 'giving']
  },
  {
    id: 'kindness-2',
    text: "How did you spread joy to someone else today?",
    category: 'kindness',
    tags: ['spreading', 'joy', 'others']
  },
  {
    id: 'kindness-3',
    text: "What's a thoughtful gesture that touched your heart?",
    category: 'kindness',
    tags: ['thoughtful', 'heart', 'touching']
  }
];

// Get a prompt for a specific date (rotates through the database)
export function getPromptForDate(date: Date): PromptData {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const promptIndex = dayOfYear % DAILY_PROMPTS.length;
  return DAILY_PROMPTS[promptIndex];
}

// Get today's prompt
export function getTodaysPromptData(): PromptData {
  return getPromptForDate(new Date());
}

// Get a random prompt (for testing or variety)
export function getRandomPrompt(): PromptData {
  const randomIndex = Math.floor(Math.random() * DAILY_PROMPTS.length);
  return DAILY_PROMPTS[randomIndex];
}

// Get prompts by category
export function getPromptsByCategory(category: PromptData['category']): PromptData[] {
  return DAILY_PROMPTS.filter(prompt => prompt.category === category);
}

// Get all categories
export function getAllCategories(): string[] {
  return [...new Set(DAILY_PROMPTS.map(prompt => prompt.category))];
}
