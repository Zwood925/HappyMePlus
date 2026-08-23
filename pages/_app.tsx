import type { AppProps } from "next/app";
import Head from 'next/head';
import { useRouter } from "next/router";
import { useEffect } from "react";
import "../styles/globals.css";
import "react-calendar/dist/Calendar.css";
import Layout from "../components/layout";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import type { Router } from "next/router";

type InnerAppProps = AppProps & { router: Router };

function InnerApp({ Component, pageProps, router }: InnerAppProps) {
  const { user, loading } = useFirebaseAuth();

  const excludedRoutes = ["/login", "/signup", "/success", "/cancel"];
  const showLayout = user && !excludedRoutes.includes(router.pathname);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return showLayout ? (
    <Layout>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
      </Head>
      <Component {...pageProps} />
    </Layout>
  ) : (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default function MyApp({ Component, pageProps, router }: AppProps & { router: Router }) {
  useEffect(() => {
    const handleRouteChangeError = (err: any, url: string) => {
      console.warn('Next.js failed to load chunk, forcing hard reload:', err);
      window.location.href = url;
    };

    router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router]);

  return (
    <InnerApp Component={Component} pageProps={pageProps} router={router} />
  );
}