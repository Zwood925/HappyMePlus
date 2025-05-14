import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

export default function SignupPage() {
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Step 1: Sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setErrorMsg(signUpError.message);
      return;
    }

    // Step 2: Manually log the user in to guarantee a session
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setErrorMsg("Login after signup failed: " + loginError.message);
      return;
    }

    // Step 3: Get the authenticated session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session || !session.user) {
      console.error("DEBUG: session fetch error or session null");
      setErrorMsg("No session available after login. Please refresh and try again.");
      return;
    }

    const userId = session.user.id;
    console.log("DEBUG: session.user.id =", userId);

    // Step 4: Insert user profile
    const { error: insertError } = await supabase.from("profiles").insert({
      id: userId,
      email,
      nickname, // ✅ add nickname to the insert
      group_code: null,
    });

    if (insertError) {
      console.error("Insert failed:", insertError);
      setErrorMsg("Database error saving new user: " + insertError.message);
      return;
    }

    // Step 5: Start Stripe checkout
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
            type="text"
            placeholder="Your Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            style={{ display: "block", marginBottom: "1rem" }}
          />
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
