import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export function withAuth(Component: any) {
  return function ProtectedRoute(props: any) {
    const session = useSession();
    const router = useRouter();
    const supabase = useSupabaseClient();

    useEffect(() => {
      if (session === null) {
        router.replace("/login");
      }
    }, [session]);

    if (session === null) return null;

    return <Component {...props} />;
  };
}
