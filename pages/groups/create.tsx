// pages/group-create.tsx
import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { withAuth } from "../lib/withAuth";

function GroupCreate() {
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [groupCode, setGroupCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const createGroup = async () => {
      setLoading(true);
      setErrorMsg("");

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setErrorMsg("Unable to fetch user.");
        setLoading(false);
        return;
      }

      const code = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ group_code: code })
        .eq("id", user.id);

      if (updateError) {
        setErrorMsg("Failed to create group. Please try again.");
        setLoading(false);
        return;
      }

      setGroupCode(code);
      setLoading(false);

      setTimeout(() => router.push("/journal"), 2000);
    };

    createGroup();
  }, []);

  return (
    <Layout>
      <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
        <h2>Creating your group...</h2>

        {loading && <p>Just a moment...</p>}

        {!loading && groupCode && (
          <>
            <p>Your group code is:</p>
            <h3>{groupCode}</h3>
            <p>Share this code with others so they can join your group.</p>
          </>
        )}

        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      </div>
    </Layout>
  );
}

export default withAuth(GroupCreate);
