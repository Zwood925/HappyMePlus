import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center border-4 border-green-300">
        <h2 className="text-3xl font-bold mb-4 text-green-700">You&rsquo;re In! 🎉</h2>
        <p className="mb-4">
          Thank you for subscribing to <strong>HappyMe+</strong>. Your account is now ready.
        </p>
        <Link href="/login" className="btn btn-link text-blue-600">
          Click here to log in
        </Link>
      </div>
    </div>
  );
}
