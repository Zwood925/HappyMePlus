import React from 'react';
import Head from 'next/head';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      <Head>
        <title>Support - HappyMe</title>
      </Head>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6 text-center">
        <div className="text-5xl">☀️</div>
        <h1 className="text-3xl font-extrabold text-gray-900">HappyMe Support</h1>
        <p className="text-gray-600">
          Need help with your account, have feedback, or want to report an issue? We&apos;re here for you.
        </p>

        <div className="bg-purple-50 border border-purple-100 rounded-xl p-6 text-left space-y-3">
          <h2 className="text-lg font-bold text-purple-900">Contact Us</h2>
          <p className="text-sm text-purple-800">
            For support inquiries, account assistance, or bug reports, email our team directly:
          </p>
          <a
            href="mailto:happymesupport@gmail.com"
            className="inline-block text-lg font-bold text-purple-600 hover:underline"
          >
            happymesupport@gmail.com
          </a>
        </div>

        <div className="text-left space-y-4 text-sm text-gray-600 pt-4">
          <h3 className="font-bold text-gray-800 text-base">Frequently Asked Questions</h3>
          <div>
            <p className="font-bold text-gray-800">How do I delete my account?</p>
            <p>Go to the Settings tab inside the HappyMe app, scroll to the bottom, and select &quot;Delete Account.&quot;</p>
          </div>
          <div>
            <p className="font-bold text-gray-800">How do Pods work?</p>
            <p>Pods are private groups where you can share moments exclusively with friends or family members who have joined using your invite code.</p>
          </div>
        </div>
      </div>
    </div>
  );
}