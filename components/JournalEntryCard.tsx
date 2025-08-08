import { format } from 'date-fns';
import { CombinedEntry } from '../hooks/useJournalData';

interface JournalEntryCardProps {
  entry: CombinedEntry;
}

export default function JournalEntryCard({ entry }: JournalEntryCardProps) {
  const isHappyMoment = entry.entryType === 'happy_moment';
  const isJournalEntry = entry.entryType === 'journal';

  return (
    <div className={`card mb-4 shadow-md ${
      isHappyMoment 
        ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-l-4 border-yellow-400' 
        : 'bg-white border-l-4 border-blue-400'
    }`}>
      <div className="card-body p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {isHappyMoment && (
              <span className="text-2xl">🎉</span>
            )}
            {isJournalEntry && (
              <span className="text-2xl">📝</span>
            )}
            <span className={`text-sm font-semibold ${
              isHappyMoment ? 'text-yellow-700' : 'text-blue-700'
            }`}>
              {isHappyMoment ? 'Happy Moment' : 'Journal Entry'}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {format(entry.created_at, 'h:mm a')}
          </span>
        </div>
        
        <p className={`text-sm ${
          isHappyMoment ? 'text-yellow-800' : 'text-gray-700'
        }`}>
          {entry.content}
        </p>
        
        {isJournalEntry && (entry as any).mood && (
          <div className="mt-2">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              (entry as any).mood === 'happy' 
                ? 'bg-green-100 text-green-800'
                : (entry as any).mood === 'sad'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {(entry as any).mood} mood
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 