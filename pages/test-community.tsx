import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { createPost, getPublicPosts, addReaction, addComment, Post } from '../lib/community';
import { withAuth } from '../lib/withAuth';

function TestCommunityPage() {
  const { user } = useFirebaseAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await getPublicPosts();
      setPosts(fetchedPosts);
      setMessage(`Fetched ${fetchedPosts.length} posts`);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setMessage('Error fetching posts');
    } finally {
      setLoading(false);
    }
  };

  const createTestPost = async () => {
    if (!user?.uid || !user?.displayName) {
      setMessage('User not logged in');
      return;
    }

    try {
      setLoading(true);
      await createPost(
        user.uid,
        user.displayName,
        `Test post from ${user.displayName} at ${new Date().toLocaleTimeString()}! 🌟`,
        true
      );
      setMessage('Post created successfully!');
      fetchPosts(); // Refresh posts
    } catch (error) {
      console.error('Error creating post:', error);
      setMessage('Error creating post');
    } finally {
      setLoading(false);
    }
  };

  const addTestReaction = async (postId: string) => {
    if (!user?.uid) {
      setMessage('User not logged in');
      return;
    }

    try {
      await addReaction(postId, user.uid, '💖');
      setMessage('Reaction added!');
      fetchPosts(); // Refresh posts
    } catch (error) {
      console.error('Error adding reaction:', error);
      setMessage('Error adding reaction');
    }
  };

  const addTestComment = async (postId: string) => {
    if (!user?.uid || !user?.displayName) {
      setMessage('User not logged in');
      return;
    }

    try {
      await addComment(postId, user.uid, user.displayName, 'This is a test comment! 😊');
      setMessage('Comment added!');
      fetchPosts(); // Refresh posts
    } catch (error) {
      console.error('Error adding comment:', error);
      setMessage('Error adding comment');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Community Test Page</h1>
        
        {/* Test Controls */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
          <div className="space-y-3">
            <button
              onClick={createTestPost}
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              Create Test Post
            </button>
            <button
              onClick={fetchPosts}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 ml-2"
            >
              Refresh Posts
            </button>
          </div>
          {message && (
            <div className="mt-3 p-2 bg-blue-50 text-blue-800 rounded">
              {message}
            </div>
          )}
        </div>

        {/* Posts Display */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Posts ({posts.length})</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="loading loading-spinner loading-lg text-purple-500"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {post.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{post.userName}</div>
                    <div className="text-sm text-gray-500">
                      {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : 'Unknown time'}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{post.content}</p>
                
                {/* Reactions */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-sm text-gray-500">Reactions:</span>
                  {post.reactions && post.reactions.length > 0 ? (
                    post.reactions.map((reaction: any, index: number) => (
                      <span key={index} className="text-sm">
                        {reaction.emoji} {reaction.count}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">No reactions</span>
                  )}
                </div>

                {/* Test Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => addTestReaction(post.id)}
                    className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                  >
                    Add 💖 Reaction
                  </button>
                  <button
                    onClick={() => addTestComment(post.id)}
                    className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No posts found. Create your first post!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(TestCommunityPage);
