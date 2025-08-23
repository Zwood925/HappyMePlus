import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { withAuth } from '../lib/withAuth';
import BottomNavigation from '../components/BottomNavigation';
import JoyChallenge from '../components/JoyChallenge';
import EnhancedPostCard from '../components/EnhancedPostCard';
import JoySharingModal from '../components/JoySharingModal';
import SocialShareModal from '../components/SocialShareModal';
import { createPost, getPublicPosts, addReaction, addComment, Post, subscribeToPosts } from '../lib/community';

interface Challenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  participants: number;
  isActive: boolean;
  endDate: Date;
  category: 'daily' | 'weekly' | 'community';
}



// Mock data for demonstration
const MOCK_CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: 'Gratitude Garden',
    description: 'Share three things you\'re grateful for today and watch your joy grow!',
    emoji: '🌱',
    participants: 127,
    isActive: true,
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    category: 'daily'
  },
  {
    id: '2',
    title: 'Kindness Ripple',
    description: 'Perform a random act of kindness and share how it made you feel',
    emoji: '💫',
    participants: 89,
    isActive: true,
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    category: 'weekly'
  },
  {
    id: '3',
    title: 'Joy Photography',
    description: 'Capture a moment of pure joy and share it with the community',
    emoji: '📸',
    participants: 234,
    isActive: true,
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    category: 'community'
  }
];



function CommunityPage() {
  const { user } = useFirebaseAuth();
  const [activeTab, setActiveTab] = useState<'challenges' | 'feed' | 'trending'>('challenges');
  const [challenges, setChallenges] = useState<Challenge[]>(MOCK_CHALLENGES);
  const [posts, setPosts] = useState<Post[]>([]);
  const [participatedChallenges, setParticipatedChallenges] = useState<string[]>([]);
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const handleChallengeParticipation = (challengeId: string) => {
    setParticipatedChallenges(prev => [...prev, challengeId]);
    setChallenges(prev => 
      prev.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, participants: challenge.participants + 1 }
          : challenge
      )
    );
  };

  const handlePostReaction = async (postId: string, emoji: string) => {
    if (!user?.uid) return;
    
    try {
      await addReaction(postId, user.uid, emoji);
      // Real-time updates will handle the UI refresh
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handlePostComment = async (postId: string, content: string) => {
    if (!user?.uid || !user?.displayName) return;
    
    try {
      await addComment(postId, user.uid, user.displayName, content);
      // Real-time updates will handle the UI refresh
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleSocialShare = (post: Post) => {
    setSelectedPost(post);
    setShowSocialShare(true);
  };

  const handlePostShare = (postId: string) => {
    // Handle post share logic
    console.log(`Shared post ${postId}`);
  };

  const handleShareJoy = async (data: { content: string; isPublic: boolean; imageFile?: File }) => {
    if (!user?.uid || !user?.displayName) return;
    
    try {
      await createPost(user.uid, user.displayName, data.content, data.isPublic, data.imageFile);
      setShowSharingModal(false);
      fetchPosts();
    } catch (error) {
      console.error('Error sharing joy:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await getPublicPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set up real-time listener for posts
    const unsubscribe = subscribeToPosts((updatedPosts) => {
      setPosts(updatedPosts);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const tabs = [
    { id: 'challenges', label: '🎯 Challenges', icon: '🎯' },
    { id: 'feed', label: '📱 Community Feed', icon: '📱' },
    { id: 'trending', label: '🔥 Trending', icon: '🔥' }
  ] as const;

  return (
    <>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🌍</div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Community</h1>
              <p className="text-xs text-gray-500">Connect and spread joy together</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowSharingModal(true)}
              className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-600 transition-colors"
            >
              🌟 Share Joy
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-20 min-h-screen bg-gray-50">
        {activeTab === 'challenges' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 space-y-4"
          >
            {/* Community Stats */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white">
              <h2 className="text-lg font-semibold mb-2">Community Impact</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">1,234</div>
                  <div className="text-xs opacity-90">Active Members</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">5,678</div>
                  <div className="text-xs opacity-90">Joy Moments</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">89</div>
                  <div className="text-xs opacity-90">Challenges</div>
                </div>
              </div>
            </div>

            {/* Challenges */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Active Challenges</h3>
              {challenges.map((challenge) => (
                <JoyChallenge
                  key={challenge.id}
                  challenge={challenge}
                  onParticipate={handleChallengeParticipation}
                  hasParticipated={participatedChallenges.includes(challenge.id)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'feed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 space-y-4"
          >
            {/* Feed Header */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Community Feed</h3>
              <p className="text-sm text-gray-600">See how others are spreading joy and positivity</p>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="loading loading-spinner loading-lg text-purple-500"></div>
                  <p className="mt-4 text-gray-600">Loading community posts...</p>
                </div>
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <EnhancedPostCard
                    key={post.id}
                    post={post}
                    onReaction={(emoji) => handlePostReaction(post.id, emoji)}
                    onComment={(content) => handlePostComment(post.id, content)}
                    onShare={() => handlePostShare(post.id)}
                    onSocialShare={handleSocialShare}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🌱</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts yet</h3>
                  <p className="text-gray-500 mb-6">Be the first to share your joy with the community!</p>
                  <button 
                    onClick={() => setShowSharingModal(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Share Your First Post
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'trending' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 space-y-4"
          >
            {/* Trending Topics */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Trending Topics</h3>
              <div className="flex flex-wrap gap-2">
                {['#GratitudeGarden', '#KindnessRipple', '#MorningJoy', '#SpreadLove', '#JoyPhotography'].map((tag) => (
                  <span
                    key={tag}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Trending Posts */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Trending Posts</h3>
              {posts
                .sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0))
                .slice(0, 3)
                .map((post) => (
                  <EnhancedPostCard
                    key={post.id}
                    post={post}
                    onReaction={(emoji) => handlePostReaction(post.id, emoji)}
                    onComment={(content) => handlePostComment(post.id, content)}
                    onShare={() => handlePostShare(post.id)}
                    onSocialShare={handleSocialShare}
                  />
                ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Joy Sharing Modal */}
      <JoySharingModal
        isOpen={showSharingModal}
        onClose={() => setShowSharingModal(false)}
        onShare={handleShareJoy}
      />

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={showSocialShare}
        onClose={() => setShowSocialShare(false)}
        post={selectedPost || { id: '', content: '', userName: '' }}
      />
    </>
  );
}

export default withAuth(CommunityPage);
