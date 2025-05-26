// Layout wrapper with animated bubble-style sidebar
import Link from 'next/link';
import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import LogoutButton from './LogoutButton';

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Bubble Sidebar */}
      <aside className="w-[90px] flex flex-col gap-6 items-center py-6 px-2 bg-gradient-to-b from-purple-200 via-pink-200 to-yellow-100 shadow-xl z-20">
        <Link href="/">
          <div className="w-[60px] h-[60px] bg-purple-500 hover:scale-105 transition rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
            🏠
          </div>
        </Link>
        <Link href="/journal">
          <div className="w-[60px] h-[60px] bg-blue-400 hover:scale-105 transition rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
            📓
          </div>
        </Link>
        <Link href="/groups">
          <div className="w-[60px] h-[60px] bg-green-400 hover:scale-105 transition rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
            👥
          </div>
        </Link>
        <Link href="/settings">
          <div className="w-[60px] h-[60px] bg-yellow-400 hover:scale-105 transition rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
            ⚙️
          </div>
        </Link>
        <div className="mt-auto">
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 relative min-h-screen bg-cyan-50 text-purple-700 px-4 py-8 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
