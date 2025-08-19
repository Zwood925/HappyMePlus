import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { getUserGroups, Group } from '../lib/groups';

interface GroupSelectorProps {
  selectedGroups: string[];
  onGroupsChange: (groupIds: string[]) => void;
  title?: string;
  description?: string;
  maxSelection?: number;
  className?: string;
}

export default function GroupSelector({
  selectedGroups,
  onGroupsChange,
  title = "Select Groups",
  description = "Choose which groups to share with:",
  maxSelection = 5,
  className = ""
}: GroupSelectorProps) {
  const { user } = useFirebaseAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user?.uid) return;
      
      try {
        const userGroups = await getUserGroups(user.uid);
        setGroups(userGroups);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user?.uid]);

  const handleGroupToggle = (groupId: string) => {
    if (selectedGroups.includes(groupId)) {
      // Remove group
      onGroupsChange(selectedGroups.filter(id => id !== groupId));
    } else {
      // Add group (if under max selection)
      if (selectedGroups.length < maxSelection) {
        onGroupsChange([...selectedGroups, groupId]);
      }
    }
  };

  const handleSelectAll = () => {
    const allGroupIds = groups.map(group => group.id);
    onGroupsChange(allGroupIds.slice(0, maxSelection));
  };

  const handleClearAll = () => {
    onGroupsChange([]);
  };

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700">{title}</h3>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
          <div className="loading loading-spinner loading-sm"></div>
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div>
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">No groups available</p>
          <p className="text-xs text-gray-400 mt-1">
            Create or join groups to share your moments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {groups.map((group) => {
          const isSelected = selectedGroups.includes(group.id);
          const isDisabled = !isSelected && selectedGroups.length >= maxSelection;
          
          return (
            <label
              key={group.id}
              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-blue-50 border-blue-200'
                  : isDisabled
                  ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleGroupToggle(group.id)}
                disabled={isDisabled}
                className="sr-only"
              />
              
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mr-3 ${
                isSelected
                  ? 'bg-blue-600 border-blue-600'
                  : 'border-gray-300'
              }`}>
                {isSelected && (
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getGroupEmoji(group.name)}</span>
                  <span className="font-medium text-sm text-gray-900 truncate">
                    {group.name}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {group.member_count} member{group.member_count !== 1 ? 's' : ''}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {selectedGroups.length > 0 && (
        <div className="text-xs text-gray-500">
          {selectedGroups.length} of {maxSelection} groups selected
        </div>
      )}
    </div>
  );
}

// Helper function to get emoji based on group name
function getGroupEmoji(groupName: string): string {
  const name = groupName.toLowerCase();
  
  if (name.includes('family')) return '👨‍👩‍👧‍👦';
  if (name.includes('friend')) return '👥';
  if (name.includes('work') || name.includes('office')) return '💼';
  if (name.includes('hobby') || name.includes('art') || name.includes('music')) return '🎨';
  if (name.includes('fitness') || name.includes('gym') || name.includes('workout')) return '💪';
  if (name.includes('study') || name.includes('school') || name.includes('class')) return '📚';
  
  return '🌟';
}
