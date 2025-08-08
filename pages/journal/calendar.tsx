import { useEffect, useState, useCallback } from 'react';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { useJournalData } from '../../hooks/useJournalData';
import dynamic from 'next/dynamic';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay } from 'date-fns';
import JournalEntryCard from '../../components/JournalEntryCard';

const Calendar = dynamic(() => import('react-calendar'), { ssr: false });

export default function JournalCalendar() {
  const { user } = useFirebaseAuth();
  const { entries, loading, error, getEntriesForDate } = useJournalData();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const tileContent = ({ date }: { date: Date }) => {
    const dayEntries = getEntriesForDate(date);
    const hasHappyMoment = dayEntries.some(entry => entry.entryType === 'happy_moment');
    const hasJournalEntry = dayEntries.some(entry => entry.entryType === 'journal');
    
    return (
      <div className="h-4 mt-1 flex justify-center gap-1">
        {hasHappyMoment && (
          <span className="text-xs">🎉</span>
        )}
        {hasJournalEntry && (
          <span className="text-xs">📝</span>
        )}
      </div>
    );
  };

  const entriesForSelected = selectedDate ? getEntriesForDate(selectedDate) : [];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4">Loading your journal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="alert alert-error">
          <span>Error loading journal: {error}</span>
        </div>
      </div>
    );
  }

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
            <div className="space-y-4">
              {entriesForSelected.map((entry) => (
                <JournalEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No entries for this date</p>
              <p className="text-gray-400 text-sm mt-2">
                Add a happy moment or journal entry to see it here!
              </p>
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-lg">
            Click on a date to view your entries for that day
          </p>
          <div className="mt-4 flex justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <span>🎉</span>
              <span>Happy Moments</span>
            </div>
            <div className="flex items-center gap-1">
              <span>📝</span>
              <span>Journal Entries</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
