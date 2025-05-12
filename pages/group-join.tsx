// pages/group-join.tsx
import { useState } from "react";
import { useSupabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

export default function GroupJoin() {
  const supabase = useSupabase();
  const router = useRouter();

  const [codeInput, setCodeInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setErrorMsg("");
    setLoading(true);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      setErrorMsg("Unable to fetch user.");
      setLoading(false);
      return;
    }

    // Optionally validate the code by checking if any user has that group_code
    const { data, error: groupError } = await supabase
      .from("profiles")
      .select("id")
      .eq("group_code", codeInput.toUpperCase())
      .limit(1);

    if (groupError || !data || data.length === 0) {
      setErrorMsg("Invalid group code. Please try again.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ group_code: codeInput.toUpperCase() })
      .eq("id", user.id);

    if (updateError) {
      setErrorMsg("Failed to join group.");
    } else {
      router.push("/journal");
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
        <h2>Join a Group</h2>
        <p>Enter the group code given to you:</p>

        <input
          type="text"
          placeholder="Enter group code"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
          style={{ display: "block", marginBottom: "1rem", width: "100%" }}
        />

        <button onClick={handleJoin} disabled={loading}>
          Join Group
        </button>

        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      </div>
    </Layout>
  );
}
