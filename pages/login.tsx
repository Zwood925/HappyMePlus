// pages/login.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

import { useSessionContext } from "@supabase/auth-helpers-react";

export default function LoginPage() {
  const supabase = useSupabaseClient();

  const router = useRouter();
  const { session, isLoading } = useSessionContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isLoading && session?.user) {
      router.push("/journal");
    }
  }, [isLoading, session]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push("/journal");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div style={{ padding: "2rem" }}>
          <p>Checking your session...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ padding: "2rem" }}>
        <h2>Log In</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: "block", marginBottom: "1rem" }}
          />
          <input
            type="password"
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ display: "block", marginBottom: "1rem" }}
          />
          <button type="submit">Log In</button>
        </form>
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      </div>
    </Layout>
  );
}
