import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { useJournalData } from '../../hooks/useJournalData';
import dynamic from 'next/dynamic';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import JournalEntryCard from '../../components/JournalEntryCard';
import BottomNavigation from '../../components/BottomNavigation';

const Calendar = dynamic(() => import('react-calendar'), { ssr: false });

export default function JournalCalendar() {
  const { user } = useFirebaseAuth();
  const { entries, loading, error, getEntriesForDate } = useJournalData();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const tileContent = ({ date }: { date: Date }) => {
    const dayEntries = getEntriesForDate(date);
    const hasHappyMoment = dayEntries.length > 0;
    
    return (
      <div className="h-4 mt-1 flex justify-center gap-1">
        {hasHappyMoment && (
          <span className="text-xs">🎉</span>
        )}
      </div>
    );
  };

  const entriesForSelected = selectedDate ? getEntriesForDate(selectedDate) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-purple-500"></div>
          <p className="mt-4 text-gray-600">Loading your calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <p className="text-red-800">Error loading calendar: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🗓️</div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Calendar</h1>
              <p className="text-xs text-gray-500">View your happy moments history</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-16 pb-20 min-h-screen bg-gray-50">
        <div className="p-4">
          <Calendar
            onChange={(value) => setSelectedDate(value as Date)}
            value={selectedDate}
            tileContent={tileContent}
            className="rounded-xl shadow-sm p-4 bg-white border border-gray-100"
          />

          {selectedDate && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4 text-center">
                Moments on {format(selectedDate, 'PPP')}
              </h2>

              {entriesForSelected.length > 0 ? (
                <div className="space-y-4">
                  {entriesForSelected.map((entry) => (
                    <JournalEntryCard key={entry.id} entry={entry} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🌟</div>
                  <p className="text-gray-600">No moments for this date</p>
                </div>
              )}
            </div>
          )}

          {!selectedDate && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Click on a date to view your happy moments
              </p>
            </div>
          )}
        </div>
      </div>
      <BottomNavigation />
    </>
  );
}