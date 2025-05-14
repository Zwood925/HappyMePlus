// pages/account-setup.tsx
import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { withAuth } from "../lib/withAuth";

function AccountSetup() {
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [step, setStep] = useState<"start" | "groupMode">("start");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSolo = async () => {
    setLoading(true);
    setErrorMsg("");

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error("❌ Error getting user:", error?.message);
      setErrorMsg("User not found. Please try again.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ group_code: null })
      .eq("id", user.id);

    if (updateError) {
      console.error("❌ Error updating group_code:", updateError.message);
      setErrorMsg("Failed to set solo mode. Please try again.");
    } else {
      router.push("/journal");
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
        <h2>Almost done! 🎉</h2>
        <p style={{ marginBottom: "1rem" }}>
          Will you be using HappyMe+ solo, or with a group?
        </p>

        {step === "start" && (
          <>
            <button
              onClick={handleSolo}
              disabled={loading}
              style={{ display: "block", marginBottom: "1rem" }}
            >
              Just Me
            </button>
            <button onClick={() => setStep("groupMode")}>
              Use With a Group
            </button>
          </>
        )}

        {step === "groupMode" && (
          <>
            <p>Would you like to create a group or join an existing one?</p>
            <button
              onClick={() => router.push("/group-create")}
              style={{ display: "block", marginBottom: "1rem" }}
            >
              Create Group
            </button>
            <button onClick={() => router.push("/group-join")}>
              Join Group
            </button>
          </>
        )}

        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      </div>
    </Layout>
  );
}

export default withAuth(AccountSetup);
