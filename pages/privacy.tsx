import React from 'react';
import Head from 'next/head';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      <Head>
        <title>Privacy Policy - HappyMe</title>
      </Head>
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last Updated: August 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">1. Introduction</h2>
          <p>
            Welcome to <strong>HappyMe</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), operated by The HappyMe Team. We respect your privacy and are committed to protecting the personal information you share with us through our mobile application.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">2. Information We Collect</h2>
          <p>We collect only the minimum data necessary to provide you with a personal journal and group sharing experience:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Account Information:</strong> Email address, display name, and unique user ID when you create an account.</li>
            <li><strong>Journal & Content Data:</strong> Text entries, happy moments, encouragement notes, and pod/group preferences you create.</li>
            <li><strong>Social & Interaction Data:</strong> Pod memberships, friend requests, and reactions sent within the app.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">3. How We Use Your Information</h2>
          <p>Your data is used strictly to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Authenticate your account and maintain security.</li>
            <li>Display your personal journal entries and sync them across your devices.</li>
            <li>Enable group sharing (&quot;pods&quot;) with users you explicitly choose to connect with.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">4. Data Sharing and Third Parties</h2>
          <p>
            We do <strong>not</strong> sell, rent, or trade your personal information or journal content to advertisers or third parties. We utilize Google Firebase for secure database hosting and authentication.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">5. Data Retention and Account Deletion</h2>
          <p>
            You retain full ownership of your data. You can delete your account at any time directly within the app by navigating to <strong>Settings &gt; Delete Account</strong>. Deleting your account permanently removes your user profile and personal data from our active databases.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">6. Contact Us</h2>
          <p>
            If you have any questions or concerns regarding this Privacy Policy, please contact us at:
          </p>
          <p className="font-semibold text-purple-600">happymesupport@gmail.com</p>
        </section>
      </div>
    </div>
  );
}