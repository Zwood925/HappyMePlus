import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-yellow-100 to-blue-100 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center border-4 border-red-300">
        <h2 className="text-3xl font-bold mb-4 text-red-600">Checkout Canceled</h2>
        <p className="mb-4">No worries — you&rsquo;re welcome to subscribe any time.</p>
        <Link href="/signup" className="btn btn-link text-blue-600">
          Return to Sign Up
        </Link>
      </div>
    </div>
  );
}
