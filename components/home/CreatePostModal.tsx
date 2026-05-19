import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GroupSelector from '../GroupSelector';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  input: string;
  onInputChange: (value: string) => void;
  selectedGroups: string[];
  onGroupsChange: (groups: string[]) => void;
  showGroupSelector: boolean;
  onToggleGroupSelector: () => void;
  submitting: boolean;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
  input,
  onInputChange,
  selectedGroups,
  onGroupsChange,
  showGroupSelector,
  onToggleGroupSelector,
  submitting
}: CreatePostModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Share Your Joy</h3>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <form onSubmit={onSubmit} className="p-4">
              <textarea
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                rows={4}
                className="w-full border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="What made you smile today? Share your joy with the world! ✨"
              />
              
<div className="mt-4">
                <button
                  type="button"
                  onClick={onToggleGroupSelector}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  {showGroupSelector ? 'Hide' : 'Share with Pods'} 
                  {selectedGroups.length > 0 && ` (${selectedGroups.length} selected)`}
                </button>
                
                {showGroupSelector && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <GroupSelector
                      selectedGroups={selectedGroups}
                      onGroupsChange={onGroupsChange}
                      title="Share with Pods"
                      description="Choose which pods to share this moment with:"
                      maxSelection={3}
                    />
                  </div>
                )}
              </div>
                            
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={!input.trim() || submitting}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="loading loading-spinner loading-sm mr-2"></div>
                      Sharing...
                    </div>
                  ) : (
                    'Share Joy ✨'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}