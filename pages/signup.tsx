import { useState } from "react";
import { useRouter } from "next/router";
import { createUserWithEmail } from "../lib/firebaseAuth";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const result = await createUserWithEmail(email, password);
      
      if (result.error) {
        setErrorMsg(result.error.message || "Failed to create account");
      } else {
        setSuccessMsg("Account created successfully!");
        
        // Redirect to home after a short delay
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
      
    } catch (error: any) {
      console.error("Sign up failed:", error);
      setErrorMsg(error.message || "Failed to create account");
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

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-xl font-semibold hover:bg-purple-700 transition duration-200"
          >
            Sign Up
          </button>

          {errorMsg && <p className="text-red-600 mt-2 text-center">{errorMsg}</p>}
          {successMsg && <p className="text-green-600 mt-2 text-center">{successMsg}</p>}
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
