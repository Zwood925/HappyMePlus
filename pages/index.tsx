// HomePage with full visuals and original logic from index.tsx
import { useEffect, useState, useCallback } from "react";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { useHappyMoments } from "../hooks/useHappyMoments";
import { useNotifications } from "../hooks/useNotifications";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import VideoCelebration from "../components/VideoCelebration";
import SmileyButton from "../components/SmileyButton";
import SadFaceButton from "../components/SadFaceButton";
import GroupSelector from "../components/GroupSelector";
import DailyPrompt from "../components/DailyPrompt";
import NotificationPermission from "../components/NotificationPermission";
import PWAInstallPrompt from "../components/PWAInstallPrompt";

const bubbleColors = [
  "bg-cyan-200",
  "bg-pink-200",
  "bg-green-200",
  "bg-yellow-200",
  "bg-purple-200",
];

export default function HomePage() {
  const { user } = useFirebaseAuth();
  const { 
    recentMoments, 
    loading: momentsLoading, 
    submitting, 
    totalCount,
    error,
    addMoment 
  } = useHappyMoments();

  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [input, setInput] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [encouragement, setEncouragement] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string>("");
  const [inboxOpen, setInboxOpen] = useState(false);
  const [showVideoCelebration, setShowVideoCelebration] = useState(false);

  const toggleInbox = () => {
    setInboxOpen((prev) => {
      const newOpenState = !prev;
      if (newOpenState && unreadCount > 0) {
        setTimeout(() => markAllAsRead(), 10000);
      }
      return newOpenState;
    });
  };

  // Removed fetchMoments - now handled by useHappyMoments hook

  const fetchNickname = useCallback(async () => {
    // TODO: Replace with Firebase Firestore queries
    // const { data, error } = await supabase
    //   .from("profiles")
    //   .select("nickname")
    //   .eq("id", user?.id)
    //   .single();
    // if (data?.nickname) setNickname(data.nickname);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNickname();
    }
  }, [user, fetchNickname]);

  const handleFeelingDown = async () => {
    // TODO: Replace with Firebase Firestore queries
    // const { data: encouragements, error: encouragementError } = await supabase
    //   .from("encouragements")
    //   .select("content");

    // if (encouragementError || !encouragements?.length) return;

    // const randomEncouragement =
    //   encouragements[Math.floor(Math.random() * encouragements.length)]?.content;

    // setEncouragement(randomEncouragement);

    // const { data: userGroups } = await supabase
    //   .from("group_members")
    //   .select("group_id")
    //   .eq("user_id", user?.id);

    // const groupIds = userGroups?.map((g) => g.group_id) || [];

    // const { data: allMembers } = await supabase
    //   .from("group_members")
    //   .select("user_id")
    //   .in("group_id", groupIds);

    // const allUserIds = Array.from(new Set(allMembers?.map((m) => m.user_id))).filter(
    //   (id) => id !== user?.id
    // );

    // const inserts = allUserIds.map((recipient_id) => ({
    //   sender_id: user?.id!,
    //   recipient_id,
    //   message: `${nickname} is having a tough day and might need some encouragement.`,
    //   created_at: new Date().toISOString(),
    // }));

    // if (inserts.length > 0) {
    //   await supabase.from("direct_encouragements").insert(inserts);
    // }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const success = await addMoment(input.trim(), selectedGroups);
    if (success) {
      setInput("");
      setSelectedGroups([]);
      setShowGroupSelector(false);
    }
  };

  const handleHappyParty = () => {
    setShowVideoCelebration(true);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  };

  const floatingBubbles = Array.from({ length: 60 }, (_, i) => {
    const size = 20 + Math.random() * 80;
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const duration = 30 + Math.random() * 40;
    const xDistance = 50 + Math.random() * 100;
    const color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];

    return (
      <motion.div
        key={i}
        className={`absolute rounded-full ${color} opacity-30`}
        style={{ width: `${size}px`, height: `${size}px`, top: `${top}%`, left: `${left}%` }}
        animate={{ x: [0, xDistance], y: [-50, -200] }}
        transition={{ duration, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />
    );
  });
  
      return (
        <>
          <div className="relative min-h-screen overflow-hidden bg-cyan-50 text-purple-700 px-2 sm:px-4 py-4 sm:py-8">
            {/* Bubbles */}
            <div className="absolute inset-0 z-0 overflow-hidden">{floatingBubbles}</div>

            {/* Encouragements Bell */}
            {user && (
              <div
                className="fixed top-20 right-4 md:right-6 cursor-pointer z-[1000] indicator"
                onClick={toggleInbox}
              >
                {unreadCount > 0 && (
                  <span className="indicator-item badge badge-secondary badge-sm animate-pulse">
                    {unreadCount}
                  </span>
                )}
                <div className="p-2 bg-base-200 rounded-full shadow-md hover:bg-base-300 transition-colors">
                  <span className="text-3xl">🔔</span>
                </div>
              </div>
            )}

            <div className="relative z-10">
              <h1 className="text-5xl font-extrabold text-center mb-8 drop-shadow">
                What’s making you happy today?
              </h1>

              {user && (
                <div className="mb-6 text-center">
                  {/* World Board Navigation */}
                  <div className="flex justify-center mb-4">
                    <Link href="/world-board">
                      <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 px-6 rounded-full shadow-sm hover:shadow-md transition-all text-sm">
                        🌍 World Board
                      </button>
                    </Link>
                  </div>
                                     <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center mb-6">
                     <SmileyButton onClick={handleHappyParty} />
                     <SadFaceButton onClick={handleFeelingDown} />
                   </div>

                  {encouragement && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 rounded-lg bg-blue-100 text-blue-900 shadow-md max-w-xl mx-auto"
                    >
                      ✨ {encouragement} ✨
                    </motion.div>
                  )}
                </div>
              )}

              {/* Notification Permission */}
              {user && (
                <div className="max-w-2xl mx-auto mb-6">
                  <NotificationPermission />
                </div>
              )}

              {/* PWA Install Prompt */}
              <PWAInstallPrompt />

              {/* Daily Prompt Section */}
              {user && (
                <div className="max-w-2xl mx-auto mb-6">
                  <DailyPrompt onResponseSubmitted={() => {
                    // Refresh happy moments when user responds to daily prompt
                    // This will be handled by the hook automatically
                  }} />
                </div>
              )}

              {user ? (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white p-4 sm:p-6 rounded-3xl shadow-xl max-w-2xl mx-auto mb-6 sm:mb-10"
                >
                                    <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={4}
                    className="textarea textarea-bordered w-full text-lg"
                    placeholder="Share a small joy, a big win, or anything that made you smile…"
                  />
                  
                  {/* Group Selection */}
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setShowGroupSelector(!showGroupSelector)}
                      className="btn btn-outline btn-sm w-full"
                    >
                      {showGroupSelector ? 'Hide' : 'Share with Groups'} 
                      {selectedGroups.length > 0 && ` (${selectedGroups.length} selected)`}
                    </button>
                    
                    {showGroupSelector && (
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <GroupSelector
                          selectedGroups={selectedGroups}
                          onGroupsChange={setSelectedGroups}
                          title="Share with Groups"
                          description="Choose which groups to share this moment with:"
                          maxSelection={3}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <button
                      type="submit"
                      className="btn bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm sm:text-base py-3 px-6 w-full rounded-full"
                      disabled={!input.trim() || submitting}
                    >
                      {submitting ? (
                        <>
                          <div className="loading loading-spinner loading-sm"></div>
                          Adding...
                        </>
                      ) : (
                        'Add Happy Moment'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-center text-lg mb-8 p-4 bg-base-200 rounded-md shadow">
                  Please{" "}
                  <Link href="/login">
                    <span className="link link-primary">log in</span>
                  </Link>{" "}
                  to share your happy moments!
                </p>
              )}

                             {user && recentMoments.length === 0 && !input && !momentsLoading && !error && (
                 <div className="text-center p-6 bg-base-200 rounded-lg shadow">
                   <p className="text-lg text-neutral-content">
                     No happy moments recorded yet. Why not add one now?
                   </p>
                 </div>
               )}

               {error && (
                 <div className="alert alert-error mb-6">
                   <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   <span>{error}</span>
                 </div>
               )}

               {user && recentMoments.length > 0 && (
                 <div className="card bg-base-200 shadow-xl p-6 mt-6">
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="text-2xl font-semibold text-secondary">
                       Your Recent Happy Moments
                     </h3>
                     <Link href="/happy-moments">
                       <button className="btn btn-sm btn-outline btn-primary">
                         See All ({totalCount})
                       </button>
                     </Link>
                   </div>
                   
                   {momentsLoading ? (
                     <div className="text-center py-4">
                       <div className="loading loading-spinner loading-md text-primary"></div>
                     </div>
                   ) : (
                     <ul className="space-y-4">
                       {recentMoments.map((moment, index) => (
                         <li
                           key={moment.id}
                           className="bg-pink-100 border-l-4 border-pink-500 shadow-md rounded-xl p-4 flex items-start gap-3 hover:shadow-lg transition"
                         >
                           <span className="text-2xl">🌟</span>
                           <div className="flex-1">
                             <p className="text-lg font-bold text-pink-800 leading-snug">
                               {moment.content}
                             </p>
                             <p className="text-sm text-pink-600 mt-1">
                               {moment.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
                             </p>
                           </div>
                         </li>
                       ))}
                     </ul>
                   )}
                 </div>
               )}

              {/* Video Celebration */}
              <VideoCelebration 
                isOpen={showVideoCelebration}
                onClose={() => setShowVideoCelebration(false)}
              />

              {/* Inbox Modal */}
              <AnimatePresence>
                {inboxOpen && user && (
                  <motion.div
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1001] flex items-center justify-center p-2 sm:p-4"
                    onClick={toggleInbox}
                  >
                    <motion.div
                      className="card w-full max-w-lg bg-base-100 shadow-xl max-h-[90vh] overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                      variants={modalVariants}
                    >
                      <div className="card-body">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="card-title text-xl text-primary">Your Encouragements</h3>
                          <button className="btn btn-sm btn-circle btn-ghost" onClick={toggleInbox}>✕</button>
                        </div>

                        {notificationsLoading && (
                          <div className="flex justify-center my-8">
                            <span className="loading loading-lg loading-spinner text-primary"></span>
                          </div>
                        )}

                        {!notificationsLoading && notifications.length === 0 && (
                          <p className="text-center text-neutral-content py-4">You have no new notifications right now. Keep shining!</p>
                        )}

                        {!notificationsLoading && notifications.length > 0 && (
                          <ul className="space-y-3 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-2">
                            {notifications.map((notification) => (
                              <li 
                                key={notification.id} 
                                className={`p-3 rounded-lg shadow cursor-pointer transition-colors ${
                                  notification.read ? 'bg-base-200' : 'bg-primary/10 border border-primary'
                                }`}
                                onClick={() => {
                                  if (!notification.read) {
                                    markAsRead(notification.id!);
                                  }
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="text-2xl">
                                    {notification.type === 'support_request' ? '💙' : 
                                     notification.type === 'encouragement' ? '💝' : 
                                     notification.type === 'group_invite' ? '👥' : '🔔'}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-base-content">
                                      {notification.title}
                                    </p>
                                    <p className="mt-1 text-base-content/80">{notification.message}</p>
                                    <p className="text-xs text-right text-base-content/60 mt-2">
                                      {notification.created_at?.toDate?.()?.toLocaleString() || 'Just now'}
                                    </p>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}

                        {unreadCount > 0 && !notificationsLoading && (
                          <div className="card-actions justify-end mt-6">
                            <button className="btn btn-primary btn-sm" onClick={() => markAllAsRead()}>
                              Mark all as read
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </>
      );
}
