import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Layout({ children }) {
  const router = useRouter()
  const isHome = router.pathname === '/'

  return (
    <div className="min-h-screen board-bg flex flex-col font-sans">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-[#eae2d5] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 group">
                {/* Chalkboard/Notice Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#d97706] group-hover:scale-105 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-xl font-extrabold tracking-tight text-[#3a322b] font-display">
                  Bulletin Board
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded text-sm font-semibold transition font-display ${
                  isHome 
                    ? 'text-[#d97706]' 
                    : 'text-[#5c5246] hover:text-[#b45309]'
                }`}
              >
                Board View
              </Link>
              
              {isHome && (
                <Link
                  href="/notices/new"
                  className="btn-primary flex items-center space-x-1 px-4 py-2 text-xs font-bold font-display"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Post Notice</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
        {/* Clearly visible Back to Home link near the top of the content area for non-homepages */}
        {!isHome && (
          <div className="mb-6 flex justify-start">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-sm font-bold text-[#8c7e70] hover:text-[#b45309] transition duration-150 font-display group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </Link>
          </div>
        )}
        
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#eae2d5] py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8c7e70] font-medium gap-4">
          <p className="font-display">© {new Date().getFullYear()} School Bulletin Board. All rights reserved.</p>
          <div className="flex space-x-4">
            <span className="font-bold text-[#5c5246] font-display">Staff Portal</span>
            <span>•</span>
            <span>Version 1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
