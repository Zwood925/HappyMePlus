import { useState } from 'react';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomEncouragement } from '../../lib/getRandomEncouragement';
import { addJournalEntry } from '../../lib/journal';
import BottomNavigation from '../../components/BottomNavigation';

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
    <>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">📝</div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Journal</h1>
              <p className="text-xs text-gray-500">Reflect on your day</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 pb-20 min-h-screen bg-gray-50">
        <div className="p-4">
          {/* Message */}
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-3">Pick a prompt:</h2>
              <div className="grid grid-cols-1 gap-3">
                {prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setSelectedPrompt(prompt)}
                    className={`p-3 rounded-lg text-left transition-colors ${
                      selectedPrompt === prompt
                        ? 'bg-purple-100 border-2 border-purple-400'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-3">How are you feeling?</h2>
              <div className="flex gap-3 flex-wrap">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    type="button"
                    onClick={() => setSelectedMood(mood.value)}
                    className={`p-3 rounded-lg transition-all ${
                      selectedMood === mood.value
                        ? 'scale-110 shadow-lg'
                        : 'hover:scale-105'
                    } ${mood.color}`}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-3">Write your thoughts:</h2>
              <textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                rows={6}
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Share your thoughts, feelings, or reflections..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !entry.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="loading loading-spinner loading-sm mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save Entry ✨'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </>
  );
}
