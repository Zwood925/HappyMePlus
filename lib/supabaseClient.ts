// lib/supabaseClient.ts

import { createBrowserClient } from "@supabase/ssr";
import { createContext, useContext } from "react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const SupabaseContext = createContext(supabase);

export const useSupabase = () => useContext(SupabaseContext);

export default supabase;
