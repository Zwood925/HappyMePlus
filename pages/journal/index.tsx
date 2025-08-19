import { useState } from 'react';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomEncouragement } from '../../lib/getRandomEncouragement';
import { addJournalEntry } from '../../lib/journal';
import Link from "next/link";

const prompts = [
  'What made you smile today?',
  'What challenged you today?',
  'What are you grateful for?',
  'What would you like to let go of?'
];

const moods = [
  { value: 'happy', emoji: '😊', color: 'bg-green-300' },
  { value: 'sad', emoji: '😢', color: 'bg-blue-300' },
  { value: 'angry', emoji: '😠', color: 'bg-red-300' },
  { value: 'neutral', emoji: '😐', color: 'bg-gray-300' },
  { value: 'love', emoji: '😍', color: 'bg-pink-300' }
];

export default function JournalPage() {
  const { user } = useFirebaseAuth();

  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [entry, setEntry] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [encouragement, setEncouragement] = useState('');
  const [notifyGroups, setNotifyGroups] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !entry.trim()) return;

    setSubmitting(true);
    setMessage('');

    try {
      // Save journal entry to Firebase
      await addJournalEntry({
        user_id: user.uid,
        content: entry,
        mood: selectedMood as any || 'neutral',
        prompt: selectedPrompt,
        type: 'manual',
        notify_groups: notifyGroups
      });

      setMessage('Entry saved! ✅');
      setEntry('');
      setSelectedMood('');
      setSelectedPrompt('');

      // TODO: Add encouragement and group notifications later
      // if ((selectedMood === 'sad' || selectedMood === 'angry')) {
      //   // Handle encouragement and group notifications
      // }

    } catch (error) {
      console.error('Error saving journal entry:', error);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-center">Dear Me 💌</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Pick a prompt:</h2>
          <div className="grid grid-cols-2 gap-3">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setSelectedPrompt(prompt)}
                className={`p-3 rounded-lg text-left transition-colors ${
                  selectedPrompt === prompt
                    ? 'bg-purple-200 border-2 border-purple-400'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">How are you feeling?</h2>
          <div className="flex gap-3 flex-wrap">
            {moods.map((mood) => (
              <button
                key={mood.value}
                type="button"
                onClick={() => setSelectedMood(mood.value)}
                className={`p-3 rounded-lg transition-colors ${
                  selectedMood === mood.value
                    ? `${mood.color} border-2 border-purple-400`
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <div className="text-sm capitalize">{mood.value}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Write your thoughts:</h2>
          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Start writing..."
            className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="notifyGroups"
            checked={notifyGroups}
            onChange={(e) => setNotifyGroups(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="notifyGroups" className="text-sm">
            Notify my groups if I'm feeling down
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Save Entry'}
        </button>

        {message && (
          <div className={`text-center p-3 rounded-lg ${
            message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </form>

      <div className="mt-8 text-center">
        <Link href="/journal/calendar" className="text-purple-600 hover:text-purple-800 underline">
          View Calendar 📅
        </Link>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">Here's something to brighten your day:</h3>
              <p className="text-gray-700 mb-4">{encouragement}</p>
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Thank you! 💜
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
