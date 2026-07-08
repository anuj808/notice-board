import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { prisma } from '@/lib/prisma'

export async function getServerSideProps() {
  try {
    const noticesRaw = await prisma.notice.findMany({
      orderBy: [
        { priority: 'desc' },
        { publishDate: 'desc' }
      ]
    })

    // Serialize Dates to JSON-safe strings for client
    const notices = noticesRaw.map((notice) => ({
      ...notice,
      publishDate: notice.publishDate ? notice.publishDate.toISOString() : null,
      createdAt: notice.createdAt.toISOString(),
      updatedAt: notice.updatedAt.toISOString(),
    }))

    return {
      props: {
        notices,
      },
    }
  } catch (error) {
    console.error('Error in getServerSideProps:', error)
    return {
      props: {
        notices: [],
        error: 'Failed to load notices from database.'
      }
    }
  }
}

export default function Home({ notices, error }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('All')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/notices/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        // Refresh the server side props data
        router.replace(router.asPath)
      } else {
        alert('Could not delete the notice. Please try again.')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred during deletion.')
    } finally {
      setConfirmingDeleteId(null)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Immediate'
    const date = new Date(dateStr)
    return date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const filteredNotices = categoryFilter === 'All'
    ? notices
    : notices.filter(n => n.category === categoryFilter)

  return (
    <div className="min-h-screen board-bg py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-[#e5ddd0] pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-[#2d2824] tracking-tight">
              School Bulletin Board
            </h1>
            <p className="text-sm text-[#7a6f62] mt-1 font-medium">
              Daily notices, announcements, and schedules
            </p>
          </div>
          <Link
            href="/notices/new"
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#5c4d3c] hover:bg-[#45392b] text-white text-sm font-semibold rounded-md shadow transition duration-150 transform hover:-translate-y-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Post New Notice</span>
          </Link>
        </header>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Filters bar */}
        <div className="flex items-center justify-between mb-8 bg-white/60 backdrop-blur-sm p-3 border border-[#eae2d5] rounded-md">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-[#7a6f62] uppercase tracking-wider px-2">Filter:</span>
            {['All', 'General', 'Exam', 'Event'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  categoryFilter === cat
                    ? 'bg-[#5c4d3c] text-white shadow-sm'
                    : 'text-[#5c4d3c] hover:bg-[#e5ddd0]/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="text-xs font-medium text-[#7a6f62]">
            Showing {filteredNotices.length} {filteredNotices.length === 1 ? 'notice' : 'notices'}
          </div>
        </div>

        {/* List Grid */}
        {filteredNotices.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white/40 border-2 border-dashed border-[#e5ddd0] rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#a39580] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="text-base font-semibold text-[#5c4d3c]">No notices found</p>
            <p className="text-sm text-[#7a6f62] mt-1 text-center">
              There are no announcements posted in this category. Click the button above to post one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNotices.map((notice, idx) => {
              const skewClass = idx % 2 === 0 ? 'paper-note-skew-left' : 'paper-note-skew-right'
              const isUrgent = notice.priority === 'Urgent'

              return (
                <article
                  key={notice.id}
                  className={`paper-note ${skewClass} p-6 flex flex-col justify-between min-h-[320px]`}
                >
                  {/* Decorative Pin */}
                  <div className={`pin ${isUrgent ? 'bg-red-600 scale-110 shadow-md animate-pulse-slow' : 'bg-amber-600'}`} />

                  {/* Header / Badges */}
                  <div>
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-semibold uppercase tracking-wider text-[#9b7b56]">
                        {notice.category}
                      </span>
                      <span className="text-[#a39580] font-medium">
                        {mounted ? formatDate(notice.publishDate) : '...'}
                      </span>
                    </div>

                    {/* Image if present */}
                    {notice.image && (
                      <div className="mb-4 overflow-hidden rounded border border-[#eae2d5] h-36 relative bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={notice.image}
                          alt={notice.title}
                          className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1572945281861-68b122e3e9d6?w=400&auto=format&fit=crop&q=60' // fallback img
                          }}
                        />
                      </div>
                    )}

                    {/* Title */}
                    <div className="flex items-start space-x-2 mb-2">
                      <h2 className="text-lg font-bold text-[#2d2824] leading-tight">
                        {notice.title}
                      </h2>
                      {isUrgent && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-extrabold bg-red-100 text-red-800 border border-red-200 uppercase tracking-wide">
                          Urgent
                        </span>
                      )}
                    </div>

                    {/* Body text truncated preview */}
                    <p className="text-sm text-[#4a423a] line-clamp-4 whitespace-pre-line mb-6 leading-relaxed">
                      {notice.body}
                    </p>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#f2ebe0]">
                    {confirmingDeleteId === notice.id ? (
                      <div className="flex items-center space-x-2 bg-red-50 border border-red-200 p-1.5 rounded-md text-xs font-semibold text-red-700 animate-fadeIn">
                        <span>Confirm?</span>
                        <button
                          onClick={() => handleDelete(notice.id)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmingDeleteId(null)}
                          className="px-2 py-1 bg-[#eae2d5] text-[#5c4d3c] rounded hover:bg-[#dcd2c1] transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <Link
                          href={`/notices/${notice.id}/edit`}
                          className="p-1.5 text-[#a39580] hover:text-[#5c4d3c] hover:bg-[#faf7f2] border border-[#eae2d5] rounded transition duration-150"
                          title="Edit notice"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => setConfirmingDeleteId(notice.id)}
                          className="p-1.5 text-[#a39580] hover:text-red-600 hover:bg-red-50 border border-[#eae2d5] rounded transition duration-150"
                          title="Delete notice"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
