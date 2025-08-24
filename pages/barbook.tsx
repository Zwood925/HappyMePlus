import { useState } from 'react';
import type { WritingSuggestions } from '@/lib/writingAssistant';

export default function BarBook() {
  const [text, setText] = useState('');
  const [genre, setGenre] = useState('rap');
  const [suggestions, setSuggestions] = useState<WritingSuggestions | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuggestions(null);
    const res = await fetch('/api/writing-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, genre }),
    });
    const data = await res.json();
    setSuggestions(data);
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">BarBook Writing Assistant</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full border p-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your bars here"
        />
        <div>
          <label className="mr-2">Genre:</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="border p-1"
          >
            <option value="rap">Rap</option>
            <option value="battle rap">Battle Rap</option>
            <option value="club rap">Club Rap</option>
            <option value="pop">Pop</option>
            <option value="country">Country</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Generating...' : 'Get Suggestions'}
        </button>
      </form>
      {suggestions && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Suggestions</h2>
          <p>
            <strong>Rhymes:</strong> {suggestions.rhymes?.join(', ')}
          </p>
          <p>
            <strong>Cadence:</strong> {suggestions.cadence}
          </p>
          <p>
            <strong>Next line:</strong> {suggestions.next_line}
          </p>
        </div>
      )}
    </div>
  );
}
