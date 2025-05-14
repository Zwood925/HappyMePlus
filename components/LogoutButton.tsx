import { useSupabaseClient } from "@supabase/auth-helpers-react";

import { useRouter } from "next/router";

export default function LogoutButton() {
  const supabase = useSupabaseClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return <button onClick={handleLogout}>Logout</button>;
}
