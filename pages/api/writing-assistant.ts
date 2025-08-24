import type { NextApiRequest, NextApiResponse } from 'next';
import { generateWritingSuggestions } from '@/lib/writingAssistant';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, genre } = req.body as { text?: unknown; genre?: unknown };

  if (typeof text !== 'string' || typeof genre !== 'string') {
    return res.status(400).json({ error: 'Expected text and genre strings' });
  }

  try {
    const suggestions = await generateWritingSuggestions(text, genre);
    return res.status(200).json(suggestions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to generate suggestions' });
  }
}
