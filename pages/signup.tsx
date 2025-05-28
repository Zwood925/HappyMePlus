import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import Link from "next/link";


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

    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      console.error("Sign up failed:", signUpError);
      setErrorMsg(signUpError.message);
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      console.error("Login after signup failed:", loginError);
      setErrorMsg("Login after signup failed: " + loginError.message);
      return;
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      console.error("Session error:", sessionError);
      setErrorMsg("No session available after login.");
      return;
    }

    const finalNickname = nickname.trim() || email.split("@")[0];
    const finalPromo = promoCode.trim() || "no_promo";

    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert([
        {
          id: session.user.id,
          nickname: finalNickname,
          promo_code: finalPromo,
        },
      ], { onConflict: "id" });

    if (upsertError) {
      console.error("Profile upsert failed:", upsertError);
      setErrorMsg("Failed to save profile: " + upsertError.message);
      return;
    }

    if (finalPromo.toUpperCase() === "FREE4EVER") {
      router.push("/");
      return;
    }

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode: finalPromo }),
      });

      const result = await response.json();

      if (response.ok && result?.url) {
        window.location.href = result.url;
      } else {
        setErrorMsg("Unable to start checkout session: " + result.error);
      }
    } catch (err: any) {
      console.error("Stripe fetch error:", err);
      setErrorMsg("Payment error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-200 via-blue-100 to-cyan-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-purple-700 mb-6">Sign Up</h1>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="email" className="block font-semibold text-sm mb-1">Email:</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-purple-300 rounded px-3 py-2 w-full"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-semibold text-sm mb-1">Password:</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-purple-300 rounded px-3 py-2 w-full"
            />
          </div>

          <div>
            <label htmlFor="nickname" className="block font-semibold text-sm mb-1">Nickname:</label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="border border-purple-300 rounded px-3 py-2 w-full"
            />
          </div>

          <div>
            <label htmlFor="promoCode" className="block font-semibold text-sm mb-1">Promo Code (optional):</label>
            <input
              id="promoCode"
              name="promoCode"
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="border border-purple-300 rounded px-3 py-2 w-full"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-xl font-semibold hover:bg-purple-700 transition duration-200"
          >
            Sign Up
          </button>

          {errorMsg && <p className="text-red-600 mt-2 text-center">{errorMsg}</p>}
        </form>

        <p className="text-sm text-center mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-600 underline hover:text-purple-800">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
