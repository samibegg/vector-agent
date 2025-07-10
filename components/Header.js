// components/Header.js
import Link from 'next/link';
// --- NEW IMPORTS ---
import { useSession, signOut } from 'next-auth/react'; // Hooks for session and sign out
import { useAuthModal } from '@/context/AuthModalContext'; // Hook to open the modal
// --- END NEW IMPORTS ---

export default function Header() {
  // --- HOOKS ---
  const { data: session, status } = useSession(); // Get session status ('loading', 'authenticated', 'unauthenticated')
  const { openModal } = useAuthModal(); // Get function to open the modal
  // --- END HOOKS ---

  return (
    <header className="w-full bg-white shadow-sm py-4 px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Left side: Logo and Brand */}
      <div className="flex items-center space-x-2">
        <img src="/images/logo.png" alt="ForgeMission Logo" className="h-11" />
        <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition">
          VectorAgent
        </Link>
      </div>

      {/* Right side: Navigation and Auth Actions */}
      <div className="flex items-center space-x-6">

        {/* Auth Section */}
        <div className="flex items-center space-x-3">
          {status === 'loading' && (
            <span className="text-sm text-gray-500">Loading...</span>
          )}

          {status === 'unauthenticated' && (
            <button
              onClick={openModal} // Open the modal on click
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
            >
              Login / Sign Up
            </button>
          )}

          {status === 'authenticated' && session?.user && (
            <>
              <span className="text-sm text-gray-700 hidden md:inline">
                Hi, {session.user.name || session.user.email}
              </span>
              <button
                onClick={() => signOut()} // Sign out on click
                className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
