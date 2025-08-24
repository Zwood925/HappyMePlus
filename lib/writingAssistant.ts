import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface WritingSuggestions {
  rhymes: string[];
  cadence: string;
  next_line: string;
}

export async function generateWritingSuggestions(text: string, genre: string): Promise<WritingSuggestions> {
  const prompt = `You are a songwriting assistant that understands genre-specific nuances such as pop, country, battle rap, and club rap.\n` +
    `Given the following lyrics and genre, provide up to three rhyme suggestions, a cadence or syllable breakdown, and one suggestion for the next line.\n` +
    `Respond in JSON with keys: rhymes (string array), cadence (string), next_line (string).\n\n` +
    `Lyrics: ${text}\nGenre: ${genre}`;

  const response = await client.responses.create({
    model: 'gpt-4.1-mini',
    input: prompt,
  });

  const output = response.output_text;

  try {
    return JSON.parse(output);
  } catch {
    return {
      rhymes: [],
      cadence: '',
      next_line: output,
    };
  }
}
