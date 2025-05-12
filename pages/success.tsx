import Layout from "../components/Layout";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <Layout>
      <div style={{ padding: "2rem" }}>
        <h2>You're In! 🎉</h2>
        <p>
          Thank you for subscribing to HappyMe+. Your account is now ready to go.
        </p>
        <p style={{ marginTop: "1rem" }}>
          <Link href="/login">Click here to log in</Link>
        </p>
      </div>
    </Layout>
  );
}
