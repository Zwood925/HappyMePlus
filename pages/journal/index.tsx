import { useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomEncouragement } from '../../lib/getRandomEncouragement';
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
  const user = useUser();
  const supabase = useSupabaseClient();

  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [entry, setEntry] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [encouragement, setEncouragement] = useState('');
  const [notifyGroups, setNotifyGroups] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !entry.trim()) return;

    const { error } = await supabase.from('journal_entries').insert({
      user_id: user.id,
      content: entry,
      mood: selectedMood,
      prompt: selectedPrompt
    });

    if (error) {
      setMessage('Something went wrong. Please try again.');
      return;
    }

    setMessage('Entry saved! ✅');
    setEntry('');
    setSelectedMood('');
    setSelectedPrompt('');

    if ((selectedMood === 'sad' || selectedMood === 'angry')) {
      const random = await getRandomEncouragement(supabase);
      if (random) {
        setEncouragement(random);
        setShowModal(true);
      }

      if (notifyGroups) {
        const { data: groupMemberships } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user.id);

        if (groupMemberships) {
          for (const group of groupMemberships) {
            const { data: groupMembers } = await supabase
              .from('group_members')
              .select('user_id')
              .eq('group_id', group.group_id);

            if (groupMembers) {
              for (const member of groupMembers) {
                if (member.user_id !== user.id) {
                  await supabase.from('direct_encouragements').insert({
                    sender_id: user.id,
                    recipient_id: member.user_id,
                    message: `${user.user_metadata?.name || 'A friend'} had a rough day. Send them some encouragement!`,
                    read: false
                  });
                }
              }
            }
          }
        }
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-center">Dear Me 💌</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Pick a prompt:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setSelectedPrompt(prompt)}
                className={`p-4 rounded-xl text-left shadow-md transition-all border-2 ${
                  selectedPrompt === prompt ? 'border-pink-500 bg-pink-100' : 'border-transparent bg-white'
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">How are you feeling?</h2>
          <div className="flex gap-4 flex-wrap">
            {moods.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setSelectedMood(m.value)}
                className={`w-[60px] h-[60px] rounded-full flex items-center justify-center text-2xl shadow-md hover:scale-110 transition-all ${
                  selectedMood === m.value ? m.color : 'bg-white border border-gray-300'
                }`}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Write it out:</h2>
          <textarea
            className="textarea textarea-bordered w-full text-lg"
            rows={5}
            placeholder="Start writing here..."
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          />
        </div>

        <div className="form-control">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-sm sm:text-base text-left break-words leading-snug">
              Notify my group if this entry is sad or angry
            </span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={notifyGroups}
              onChange={() => setNotifyGroups(!notifyGroups)}
            />
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={!entry.trim() || !selectedMood}
            className="btn btn-primary btn-wide text-lg"
          >
            Save Entry
          </button>
        </div>

        <div className="text-center mt-4">
          <Link href="/journal/calendar" className="link link-primary text-sm underline">
            📅 View past entries
          </Link>
        </div>

        {message && (
          <div className="text-center text-green-600 font-semibold text-lg">
            {message}
          </div>
        )}
      </form>

      {/* Encouragement Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-xl p-6 max-w-md w-full text-center shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4 text-purple-700">💛 Encouragement</h2>
              <p className="text-lg text-gray-700">{encouragement}</p>
              <button className="btn btn-sm mt-6" onClick={() => setShowModal(false)}>Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
