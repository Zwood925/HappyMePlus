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

  // Show loading spinner while checking auth state
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
        {/* This completely prevents the annoying iOS auto-zoom and makes it feel native */}
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
  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  return <InnerApp Component={Component} pageProps={pageProps} router={router} />;
}
// 
