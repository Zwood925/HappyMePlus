// TODO: Replace with Firebase Firestore queries
// import { SupabaseClient } from "@supabase/supabase-js";

export async function getRandomEncouragement(
  // supabase: SupabaseClient,
  category?: string
) {
  // TODO: Replace with Firebase Firestore queries
  // let query = supabase.from("encouragements").select("content");

  // if (category) {
  //   query = query.eq("category", category);
  // }

  // const { data, error } = await query;

  // if (error) {
  //   console.error("Error fetching encouragements:", error.message);
  //   return null;
  // }

  // if (!data || data.length === 0) return null;

  // // 🎲 Truly random selection client-side
  // const randomIndex = Math.floor(Math.random() * data.length);
  // return data[randomIndex].content;

  // Temporary placeholder - return a default encouragement
  const defaultEncouragements = [
    "You're doing great! Keep going! 🌟",
    "Every day is a new opportunity to shine! ✨",
    "You have the strength to overcome any challenge! 💪",
    "Your positive attitude is inspiring! 🌈",
    "Remember, you are capable of amazing things! 🚀",
    "Take it one step at a time - you've got this! 🎯",
    "Your resilience is admirable! 🏆",
    "You make a difference in the world! 🌍",
    "Believe in yourself - you're stronger than you know! 💎",
    "Today is your day to shine! ⭐"
  ];

  const randomIndex = Math.floor(Math.random() * defaultEncouragements.length);
  return defaultEncouragements[randomIndex];
}
