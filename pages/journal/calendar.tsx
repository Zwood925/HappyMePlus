import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import dynamic from 'next/dynamic';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay } from 'date-fns';

const Calendar = dynamic(() => import('react-calendar'), { ssr: false });

interface Entry {
  id: string;
  content: string;
  created_at: string;
  mood: string;
}

export default function JournalCalendar() {
  const { user } = useFirebaseAuth();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchEntries = async () => {
    if (!user) return;
    // TODO: Replace with Firebase Firestore
    // const { data, error } = await supabase
    //   .from('journal_entries')
    //   .select('*')
    //   .eq('user_id', user.id);
    // if (!error && data) setEntries(data);
    
    // Temporary placeholder
    setEntries([]);
  };

  useEffect(() => {
    fetchEntries();
  }, [user]);

  const moodDot = (mood: string) => {
    const color =
      mood === 'happy'
        ? 'bg-green-400'
        : mood === 'sad'
        ? 'bg-blue-400'
        : mood === 'angry'
        ? 'bg-red-400'
        : mood === 'neutral'
        ? 'bg-gray-400'
        : 'bg-pink-400';
    return <span className={`w-2 h-2 rounded-full ${color}`} />;
  };

  const tileContent = ({ date }: { date: Date }) => {
    const moodsOnThisDay = entries
      .filter((entry) => isSameDay(new Date(entry.created_at), date))
      .map((entry) => entry.mood);
    const uniqueMoods = [...new Set(moodsOnThisDay)];
    return (
      <div className="h-4 mt-1 flex justify-center gap-1">
        {uniqueMoods.map((m, i) => (
          <div key={i}>{moodDot(m)}</div>
        ))}
      </div>
    );
  };

  const entriesForSelected = entries.filter((entry) =>
    selectedDate ? isSameDay(new Date(entry.created_at), selectedDate) : false
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-6">Mood Calendar 🗓️</h1>

      <Calendar
        onChange={(value) => setSelectedDate(value as Date)}
        value={selectedDate}
        tileContent={tileContent}
        className="rounded-xl shadow-md p-4 bg-white"
      />

      {selectedDate && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Entries for {format(selectedDate, 'PPP')}
          </h2>

          {entriesForSelected.length > 0 ? (
            <ul className="space-y-4">
              {entriesForSelected.map((entry) => (
                <li
                  key={entry.id}
                  className="bg-base-100 rounded-xl p-4 shadow border-l-4"
                  style={{
                    borderColor:
                      entry.mood === 'happy'
                        ? '#4ade80'
                        : entry.mood === 'sad'
                        ? '#60a5fa'
                        : entry.mood === 'angry'
                        ? '#f87171'
                        : entry.mood === 'neutral'
                        ? '#a3a3a3'
                        : '#f9a8d4',
                  }}
                >
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>
                      {entry.mood === 'happy'
                        ? '😊'
                        : entry.mood === 'sad'
                        ? '😢'
                        : entry.mood === 'angry'
                        ? '😠'
                        : entry.mood === 'neutral'
                        ? '😐'
                        : '❤️'}{' '}
                      {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                    </span>
                    <span>{format(new Date(entry.created_at), 'p')}</span>
                  </div>
                  <p className="text-purple-800">{entry.content}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No entries for this day yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
