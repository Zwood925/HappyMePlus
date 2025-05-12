import { useEffect } from "react";
import { useUser } from "../lib/auth";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

export default function SettingsPage() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <Layout>
      <h2>Settings</h2>
      <p>Manage your preferences here.</p>
    </Layout>
  );
}
