import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import "../styles/globals.css";
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
      <Component {...pageProps} />
    </Layout>
  ) : (
    <Component {...pageProps} />
  );
}

export default function MyApp({ Component, pageProps, router }: AppProps & { router: Router }) {
  return <InnerApp Component={Component} pageProps={pageProps} router={router} />;
}
