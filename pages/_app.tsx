import type { AppProps } from "next/app";
import { useState } from "react";
import { useRouter } from "next/router";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import {
  SessionContextProvider,
  useSession,
} from "@supabase/auth-helpers-react";
import "../styles/globals.css";
import Layout from "../components/Layout";
import type { Router } from "next/router";

type InnerAppProps = AppProps & { router: Router };

function InnerApp({ Component, pageProps, router }: InnerAppProps) {
  const session = useSession();

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

export default function MyApp({ Component, pageProps, router }: AppProps & { router: Router }) {
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <InnerApp Component={Component} pageProps={pageProps} router={router} />
    </SessionContextProvider>
  );
}
