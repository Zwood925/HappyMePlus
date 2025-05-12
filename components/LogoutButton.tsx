import { useSupabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function LogoutButton() {
  const supabase = useSupabase();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return <button onClick={handleLogout}>Logout</button>;
}
