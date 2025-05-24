import { useEffect, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useEncouragements } from "../lib/useEncouragements";
import { motion, AnimatePresence } from "framer-motion";

const bubbleColors = [
  "bg-cyan-200",
  "bg-pink-200",
  "bg-green-200",
  "bg-yellow-200",
  "bg-purple-200",
];

export default function PlaygroundPage() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [input, setInput] = useState("");
  const [myMoments, setMyMoments] = useState<string[]>([]);

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
        // Optional: mark as read
      }
      return newOpenState;
    });
  };

  const fetchMoments = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("happy_moments")
      .select("content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMyMoments(data.map((row) => row.content));
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

    if (!insertError && momentData?.id) {
      setInput("");
      fetchMoments();
    }
  };

  useEffect(() => {
    if (user) fetchMoments();
    else setMyMoments([]);
  }, [user]);

  const handleHappyParty = () => {
    setIsPartyTime(true);
    const phrases = [
      "Party Time!",
      "Feeling Groovy!",
      "Happiness Activated!",
      "Woohoo! It's a Good Day!",
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
    <div className="relative min-h-screen overflow-hidden bg-cyan-50 text-purple-700 px-4 py-8">
      {/* BUBBLES */}
      <div className="absolute inset-0 z-0 overflow-hidden">{floatingBubbles}</div>

      <div className="relative z-10">
        <h1 className="text-5xl font-extrabold text-center mb-8 drop-shadow">
          What’s making you happy today?
        </h1>

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
              placeholder="Share your sunshine..."
            />
            <div className="mt-4 text-center">
              <button
                type="submit"
                className="btn bg-pink-500 hover:bg-pink-600 text-white font-bold text-lg px-8 rounded-full"
                disabled={!input.trim()}
              >
                Add Moment
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center mb-10">
            <textarea
              disabled
              placeholder="This would be your happy moment input"
              className="textarea textarea-bordered w-full max-w-xl text-center mx-auto"
            />
            <button className="btn btn-disabled mt-4">Log in to submit</button>
          </div>
        )}

        {!user && (
          <div className="max-w-2xl mx-auto bg-pink-100 rounded-2xl p-6 shadow-inner">
            <h2 className="text-3xl font-bold mb-4 text-center">Sample Happy Moments</h2>
            <ul className="space-y-3">
              <li className="bg-white rounded-lg p-4 shadow text-purple-700 font-medium">
                I danced in the kitchen with my kid.
              </li>
              <li className="bg-white rounded-lg p-4 shadow text-purple-700 font-medium">
                Someone complimented my smile today.
              </li>
              <li className="bg-white rounded-lg p-4 shadow text-purple-700 font-medium">
                I finished a task I was dreading — and it felt great.
              </li>
            </ul>
          </div>
        )}

        {user && myMoments.length > 0 && (
          <div className="max-w-2xl mx-auto bg-pink-100 rounded-2xl p-6 shadow-inner">
            <h2 className="text-3xl font-bold mb-4 text-center">Your Happy Moments</h2>
            <ul className="space-y-3">
              {myMoments.map((moment, idx) => (
                <li
                  key={idx}
                  className="bg-white rounded-lg p-4 shadow text-purple-700 font-medium"
                >
                  {moment}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-center mt-10">
          <button
            onClick={handleHappyParty}
            className="btn bg-green-400 hover:bg-green-500 text-white text-lg font-bold px-8 py-3 rounded-full shadow-lg"
          >
            🎉 I Feel Good! 🥳
          </button>
        </div>
      </div>

      {/* PARTY TIME */}
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
    </div>
  );
}
