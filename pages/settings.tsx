import Layout from "../components/Layout";
import { withAuth } from "../lib/withAuth";

function SettingsPage() {
  return (
    <Layout>
      <h2>Settings</h2>
      <p>Manage your preferences here.</p>
    </Layout>
  );
}

export default withAuth(SettingsPage);
