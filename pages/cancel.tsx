import Layout from "../components/Layout";
import Link from "next/link";

export default function CancelPage() {
  return (
    <Layout>
      <div style={{ padding: "2rem" }}>
        <h2>Checkout Canceled</h2>
        <p>No worries — you're welcome to subscribe any time.</p>
        <p style={{ marginTop: "1rem" }}>
          <Link href="/signup">Return to Sign Up</Link>
        </p>
      </div>
    </Layout>
  );
}
