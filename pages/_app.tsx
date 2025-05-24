import type { AppProps } from "next/app";
import { useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import {
  SessionContextProvider,
  useSession,
} from "@supabase/auth-helpers-react";
import "../styles/globals.css";
import Layout from "../components/Layout";
import { useRouter } from "next/router";

function InnerApp({ Component, pageProps }: AppProps) {
  const session = useSession();
  const router = useRouter();

  const excludedRoutes = ["/login", "/signup", "/success", "/cancel"];
  const showLayout = session && !excludedRoutes.includes(router.pathname);

  return showLayout ? (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  ) : (
    <Component {...pageProps} />
  );
}

export default function MyApp({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <InnerApp Component={Component} pageProps={pageProps} />
    </SessionContextProvider>
  );
}
