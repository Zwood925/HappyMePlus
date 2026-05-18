import React from 'react';
import Link from 'next/link';

export default function WelcomeScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">✨</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to HappyMe+
        </h1>
        <p className="text-gray-600 mb-8">
          A social media of joy, not comparison. Share what makes you smile and spread happiness with the world.
        </p>
        <div className="space-y-4">
          <Link href="/login">
            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
              Login
            </button>
          </Link>
          <Link href="/signup">
            <button className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all">
              Create Account
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
