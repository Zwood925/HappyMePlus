import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import Layout from "../components/layout";
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
      <div className="p-6 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">Almost done! 🎉</h2>
        <p className="mb-4">
          Will you be using HappyMe+ solo, or with a group?
        </p>

        {errorMsg && <p className="text-red-500 mb-2">{errorMsg}</p>}

        <div className="flex flex-col gap-3">
          <button
            className="btn btn-primary"
            onClick={() => setStep("groupMode")}
          >
            Use with a Group
          </button>
          <button className="btn btn-outline" onClick={handleSolo} disabled={loading}>
            Use Solo
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(AccountSetup);
