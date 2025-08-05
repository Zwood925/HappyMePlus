import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { signInWithEmail } from "../lib/firebaseAuth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useFirebaseAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [loading, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await signInWithEmail(email, password);
      router.push("/");
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to sign in");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-pink-100 via-yellow-100 to-blue-100">
        <p className="text-lg font-semibold text-gray-700">Checking your session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-yellow-100 to-blue-100 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border-4 border-pink-300">
        <h2 className="text-3xl font-bold text-center mb-6 text-purple-700">
          🎉 Welcome Back!
        </h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input input-bordered w-full"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input input-bordered w-full"
          />
          <button type="submit" className="btn btn-primary w-full">
            🚀 Log In
          </button>
        </form>

        {errorMsg && (
          <p className="mt-4 text-center text-red-500 font-semibold">
            {errorMsg}
          </p>
        )}

        <p className="text-sm text-center mt-6">
          New user?{" "}
          <Link href="/signup" className="text-purple-600 underline hover:text-purple-800">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
