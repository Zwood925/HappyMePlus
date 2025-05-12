import { useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "../lib/auth";
import Layout from "../components/Layout";

export default function JournalPage() {
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <Layout>
      <h2>Let it out. This space is all yours</h2>
      <p>This is your private journal space.</p>
    </Layout>
  );
}
