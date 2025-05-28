// HomePage with full visuals and original logic from index.tsx
import { useEffect, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useEncouragements } from "../lib/useEncouragements";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const bubbleColors = [
  "bg-cyan-200",
  "bg-pink-200",
  "bg-green-200",
  "bg-yellow-200",
  "bg-purple-200",
];

export default function HomePage() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [input, setInput] = useState("");
  const [myMoments, setMyMoments] = useState<{ id: number; content: string; created_at: string }[]>([]);
  const [encouragement, setEncouragement] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string>("");

  const {
    encouragements,
    unreadCount,
    loading: encouragementsLoading,
    markAllAsRead,
  } = useEncouragements();
  const [inboxOpen, setInboxOpen] = useState(false);
  const [isPartyTime, setIsPartyTime] = useState(false);
  const [emojis, setEmojis] = useState<string[]>([]);
  const [partyPhrase, setPartyPhrase] = useState("");

  const toggleInbox = () => {
    setInboxOpen((prev) => {
      const newOpenState = !prev;
      if (newOpenState && unreadCount > 0) {
        // setTimeout(() => markAllAsRead(), 10000);
      }
      return newOpenState;
    });
  };

  const fetchMoments = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("happy_moments")
      .select("id, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMyMoments(data);
    }
  };

  const fetchNickname = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", user?.id)
      .single();
    if (data?.nickname) setNickname(data.nickname);
  };

  useEffect(() => {
    if (user) {
      fetchMoments();
      fetchNickname();
    } else {
      setMyMoments([]);
    }
  }, [user]);

  const handleFeelingDown = async () => {
    const { data: encouragements, error: encouragementError } = await supabase
      .from("encouragements")
      .select("content");

    if (encouragementError || !encouragements?.length) return;

    const randomEncouragement =
      encouragements[Math.floor(Math.random() * encouragements.length)]?.content;

    setEncouragement(randomEncouragement);

    const { data: userGroups } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user?.id);

    const groupIds = userGroups?.map((g) => g.group_id) || [];

    const { data: allMembers } = await supabase
      .from("group_members")
      .select("user_id")
      .in("group_id", groupIds);

    const allUserIds = Array.from(new Set(allMembers?.map((m) => m.user_id))).filter(
      (id) => id !== user?.id
    );

    const inserts = allUserIds.map((recipient_id) => ({
      sender_id: user?.id!,
      recipient_id,
      message: `${nickname} is having a tough day and might need some encouragement.`,
      created_at: new Date().toISOString(),
    }));

    if (inserts.length > 0) {
      await supabase.from("direct_encouragements").insert(inserts);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const { data: momentData, error: insertError } = await supabase
      .from("happy_moments")
      .insert([{ content: input, user_id: user.id }])
      .select("id")
      .single();

    if (insertError || !momentData?.id) {
      console.error("Error inserting moment:", insertError);
      return;
    }

    const momentId = momentData.id;

    const { data: groupMemberships, error: groupError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id);

    if (groupMemberships && groupMemberships.length > 0) {
      const linkInserts = groupMemberships.map((group) => ({
        group_id: group.group_id,
        moment_id: momentId,
      }));

      const { error: linkError } = await supabase
        .from("group_moments")
        .insert(linkInserts);

      if (linkError) {
        console.error("Error inserting into group_moments:", linkError);
      }
    }

    setInput("");
    fetchMoments();
  };

  const handleHappyParty = () => {
    setIsPartyTime(true);
    const phrases = [
      "Party Time!",
      "Feeling Groovy!",
      "Happiness Activated!",
      "Woohoo! It&apos;s a Good Day!",
      "Joy Explosion!",
    ];
    setPartyPhrase(phrases[Math.floor(Math.random() * phrases.length)]);

    const randomEmojis = Array.from({ length: 15 }, () =>
      String.fromCodePoint(0x1f600 + Math.floor(Math.random() * 40))
    );
    setEmojis(randomEmojis);

    setTimeout(() => {
      setIsPartyTime(false);
      setEmojis([]);
      setPartyPhrase("");
    }, 3500);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  };

  const emojiVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.05 + 0.3,
        type: "spring",
        stiffness: 100,
      },
    }),
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
          <div className="relative min-h-screen overflow-hidden bg-cyan-50 text-purple-700 px-4 py-8">
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
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleHappyParty}
                      className="btn btn-accent w-full sm:btn-wide btn-lg shadow-lg transform hover:scale-105 transition-transform whitespace-normal text-center"
                      disabled={isPartyTime}
                    >
                      <span className="mr-2 text-xl">🎉</span>
                      I Feel Good!
                      <span className="ml-2 text-xl">🥳</span>
                    </button>


                    <button
                      onClick={handleFeelingDown}
                      style={{
                        backgroundColor: 'blue',
                        color: 'white',
                        border: 'none',
                        padding: '10px 15px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '1.125rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        minHeight: '3rem',
                        display: 'inline-flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '8px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      feelin kinda down 🌧️
                    </button>
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

              {user ? (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white p-6 rounded-3xl shadow-xl max-w-2xl mx-auto mb-10"
                >
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={4}
                    className="textarea textarea-bordered w-full text-lg"
                    placeholder="Share a small joy, a big win, or anything that made you smile…"
                  />
                  <div className="mt-4 text-center">
                    <button
                      type="submit"
                      className="btn bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm sm:text-base py-3 px-6 w-full rounded-full"
                      disabled={!input.trim()}
                    >
                      Add Happy Moment
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

              {user && myMoments.length === 0 && !input && (
                <div className="text-center p-6 bg-base-200 rounded-lg shadow">
                  <p className="text-lg text-neutral-content">
                    No happy moments recorded yet. Why not add one now?
                  </p>
                </div>
              )}

              {user && myMoments.length > 0 && (
                <div className="card bg-base-200 shadow-xl p-6 mt-6">
                  <h3 className="text-2xl font-semibold mb-4 text-secondary">
                    Your Recent Happy Moments
                  </h3>
                  <ul className="space-y-4">
                    {myMoments.map((moment, index) => (
                      <li
                        key={`${moment.id}-${index}`}
                        className="bg-pink-100 border-l-4 border-pink-500 shadow-md rounded-xl p-4 flex items-start gap-3 hover:shadow-lg transition"
                      >
                        <span className="text-2xl">🌟</span>
                        <p className="text-lg font-bold text-pink-800 leading-snug">
                          {moment.content || "No Happy Moment Found!"}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Party Time Overlay */}
              <AnimatePresence>
                {isPartyTime && (
                  <motion.div
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="fixed inset-0 z-[9999] pointer-events-none flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm"
                  >
                    <motion.p
                      initial={{ y: -50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 120 }}
                      className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg px-4 text-center"
                    >
                      {partyPhrase}
                    </motion.p>
                    <div className="text-4xl md:text-5xl flex flex-wrap justify-center max-w-sm">
                      {emojis.map((emoji, index) => (
                        <motion.span
                          key={index}
                          custom={index}
                          variants={emojiVariants}
                          initial="hidden"
                          animate="visible"
                          className="inline-block m-1"
                        >
                          {emoji}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Inbox Modal */}
              <AnimatePresence>
                {inboxOpen && user && (
                  <motion.div
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1001] flex items-center justify-center p-4"
                    onClick={toggleInbox}
                  >
                    <motion.div
                      className="card w-full max-w-lg bg-base-100 shadow-xl"
                      onClick={(e) => e.stopPropagation()}
                      variants={modalVariants}
                    >
                      <div className="card-body">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="card-title text-xl text-primary">Your Encouragements</h3>
                          <button className="btn btn-sm btn-circle btn-ghost" onClick={toggleInbox}>✕</button>
                        </div>

                        {encouragementsLoading && (
                          <div className="flex justify-center my-8">
                            <span className="loading loading-lg loading-spinner text-primary"></span>
                          </div>
                        )}

                        {!encouragementsLoading && encouragements.length === 0 && (
                          <p className="text-center text-neutral-content py-4">You have no new encouragements right now. Keep shining!</p>
                        )}

                        {!encouragementsLoading && encouragements.length > 0 && (
                          <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                            {encouragements.map((enc) => (
                              <li key={enc.id} className={`p-3 rounded-lg shadow ${enc.read_at ? 'bg-base-200' : 'bg-primary/10 border border-primary'}`}>
                                <p className="font-semibold text-base-content">
                                  {enc.message
                                    ? enc.message
                                    : `${enc.sender_name || "An anonymous friend"} sent you a boost:`}
                                </p>

                                <p className="mt-1 text-base-content/80">{enc.message}</p>
                                <p className="text-xs text-right text-base-content/60 mt-2">
                                  {new Date(enc.created_at).toLocaleString()}
                                </p>
                              </li>
                            ))}
                          </ul>
                        )}

                        {unreadCount > 0 && !encouragementsLoading && (
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
