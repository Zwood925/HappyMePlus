import { SupabaseClient } from "@supabase/supabase-js";

export async function getRandomEncouragement(
  supabase: SupabaseClient,
  category?: string
) {
  let query = supabase.from("encouragements").select("content");

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching encouragements:", error.message);
    return null;
  }

  if (!data || data.length === 0) return null;

  // 🎲 Truly random selection client-side
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex].content;
}
