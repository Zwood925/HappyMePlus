import { useState } from "react";
import { useSupabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

export default function SignupPage() {
  const supabase = useSupabase();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Step 1: Sign up user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setErrorMsg(signUpError.message);
      return;
    }

    const userId = signUpData?.user?.id;
    console.log("DEBUG: userId from signUp =", userId);

    const { data: sessionResult, error: sessionError } = await supabase.auth.getSession();
    console.log("DEBUG: session at insert =", sessionResult);
    if (sessionError) {
      console.error("DEBUG: session fetch error", sessionError.message);
    }

    if (!userId) {
      setErrorMsg("No user ID returned from signup.");
      return;
    }

    // Step 2: Insert user profile into 'profiles' table
    console.log("Inserting into profiles with ID:", userId);

    const { error: insertError } = await supabase.from("profiles").insert({
      id: userId,
      email,
      group_code: null,
    });

    if (insertError) {
      console.error("Insert failed:", insertError);
      setErrorMsg("Database error saving new user: " + insertError.message);
      return;
    }

    // Step 3: Start Stripe checkout
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, promoCode }),
      });

      const result = await response.json();

      if (result.url) {
        window.location.assign(result.url);
      } else {
        setErrorMsg("Failed to redirect to Stripe checkout.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An error occurred while starting checkout.");
    }
  };

  return (
    <Layout>
      <div style={{ padding: "2rem" }}>
        <h2>Create Your Account</h2>
        <form onSubmit={handleSignUp}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: "block", marginBottom: "1rem" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ display: "block", marginBottom: "1rem" }}
          />
          <input
            type="text"
            placeholder="Promo Code (optional)"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            style={{ display: "block", marginBottom: "1rem" }}
          />
          <button type="submit">Sign Up</button>
        </form>
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      </div>
    </Layout>
  );
}
