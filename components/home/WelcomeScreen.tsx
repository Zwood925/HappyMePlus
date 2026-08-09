import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function WelcomeScreen() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans overflow-x-hidden">
      {/* Navigation - UPDATED WITH SAFE AREA */}
      <nav 
        className="w-full px-6 pb-4 flex justify-between items-center bg-white/80 backdrop-blur-md fixed top-0 z-50 border-b border-gray-100"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
      >
        <div className="flex items-center space-x-2">
          <span className="text-2xl">✨</span>
          <span className="text-xl font-bold text-gray-800 tracking-tight">HappyMe+</span>
        </div>
        <Link href="/login">
          <button className="text-purple-600 font-medium hover:text-purple-700 px-4 py-2">
            Log In
          </button>
        </Link>
      </nav>

      {/* Hero Section - Bumped pt-28 to pt-32 to account for taller header */}
      <main className="flex-1 pt-32 pb-16 px-6 flex flex-col items-center justify-center text-center">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="max-w-2xl mx-auto"
        >
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold tracking-wide">
            Social Media, Reimagined 🌿
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
            Share your joy, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
              not your status.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-lg mx-auto">
            A safe, private space to document what makes you smile and share it exclusively with the people who matter most. No vanity metrics. No toxic algorithms. Just good vibes.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4">
            <Link href="/signup" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95">
                Start Your Joy Journal
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Feature Showcase */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full px-4"
        >
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-left">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Private Pods</h3>
            <p className="text-gray-600">Create intimate groups for your family, friends, or coworkers. Share your moments only with the pods you choose.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-left">
            <div className="text-4xl mb-4">🗓️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Joy Calendar</h3>
            <p className="text-gray-600">Look back at your month and see a visual history of exactly what made you happy. Your personal time capsule of joy.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-left">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Zero Toxicity</h3>
            <p className="text-gray-600">We removed everything that makes social media exhausting. No follower counts, no algorithmic feeds, no negativity.</p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-gray-500 text-sm border-t border-gray-100 bg-white">
        <p>© {new Date().getFullYear()} HappyMe+. Built with joy. ✨</p>
      </footer>
    </div>
  );
}