import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function TestPage() {
  useEffect(() => {
    const testInsert = async () => {
      const { data, error } = await supabase.from("users").insert([
        {
          email: "test@user.com",
          nickname: "Tester",
          phone: "555-1234",
          stripe_status: "free",
        },
      ]);

      if (error) {
        console.error("❌ Supabase insert error:", error);
      } else {
        console.log("✅ Supabase insert success:", data);
      }
    };

    testInsert();
  }, []);

  return <div className="p-4 text-xl">Testing Supabase connection...</div>;
}
