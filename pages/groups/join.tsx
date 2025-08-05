// pages/group-join.tsx
import { useState } from "react";
import { useFirebaseAuth } from "../../hooks/useFirebaseAuth";
import { useRouter } from "next/router";
import Layout from "../../components/layout";
import { withAuth } from "../../lib/withAuth";

function GroupJoin() {
  const { user } = useFirebaseAuth();
  const router = useRouter();

  const [codeInput, setCodeInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setErrorMsg("");
    setLoading(true);

    // TODO: Replace with Firebase Firestore
    // const {
    //   data: { user },
    //   error,
    // } = await supabase.auth.getUser();

    if (!user) {
      setErrorMsg("Unable to fetch user.");
      setLoading(false);
      return;
    }

    // TODO: Replace with Firebase Firestore
    // const { data, error: groupError } = await supabase
    //   .from("profiles")
    //   .select("id")
    //   .eq("group_code", codeInput.toUpperCase())
    //   .limit(1);

    // if (groupError || !data || data.length === 0) {
    //   setErrorMsg("Invalid group code. Please try again.");
    //   setLoading(false);
    //   return;
    // }

    // const groupId = data[0].id;
    // console.log("🧠 Attempting to join group");
    // console.log("User ID:", user.id);
    // console.log("Group ID:", groupId);

    // const { error: updateError } = await supabase
    //   .from("profiles")
    //   .update({ group_code: codeInput.toUpperCase() })
    //   .eq("id", user.id);

    // if (updateError) {
    //   setErrorMsg("Failed to join group (profile update).");
    //   setLoading(false);
    //   return;
    // }

    // // ✅ Fix: Use a string for onConflict, not a string[]
    // const { error: memberError } = await supabase
    //   .from("group_members")
    //   .upsert(
    //     [{ user_id: user.id, group_id: groupId }],
    //     { onConflict: "user_id,group_id" }
    //   );

    // if (memberError) {
    //   console.error("🚫 group_members insert error:", memberError.message);
    //   setErrorMsg("Error joining group. Please try again.");
    // } else {
    //   console.log("✅ User successfully added to group_members.");
    //   router.push("/journal");
    // }

    setErrorMsg("Feature coming soon! 🚧");
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
          id="group-code-input"
          name="group-code-input"
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

export default withAuth(GroupJoin);
