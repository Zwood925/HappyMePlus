import { useEffect } from "react";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { useRouter } from "next/router";
import Layout from "../components/layout";

export default function EncouragementsPage() {
  const { user } = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <Layout>
      <h2>Encouragements</h2>
      <p>This is where daily encouragements will show.</p>
    </Layout>
  );
}
