import { format } from 'date-fns';
import { HappyMoment } from '../hooks/useJournalData';

interface JournalEntryCardProps {
  entry: HappyMoment;
}

export default function JournalEntryCard({ entry }: JournalEntryCardProps) {
  return (
    <div className="card mb-4 shadow-md bg-gradient-to-r from-yellow-100 to-orange-100 border-l-4 border-yellow-400">
      <div className="card-body p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <span className="text-sm font-semibold text-yellow-700">
              Happy Moment
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {format(entry.created_at, 'h:mm a')}
          </span>
        </div>
        
        <p className="text-sm text-yellow-800">
          {entry.content}
        </p>
      </div>
    </div>
  );
}