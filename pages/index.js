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
    <div className="w-full">
      {/* Global Error Banner */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded text-sm font-semibold shadow-sm font-display">
          {error}
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 bg-white/70 backdrop-blur-sm p-4 border border-[#eae2d5] rounded shadow-sm gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#8c7e70] uppercase tracking-wider px-2 font-display">Filter Category:</span>
          {['All', 'General', 'Exam', 'Event'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-all duration-150 font-display ${
                categoryFilter === cat
                  ? 'bg-[#d97706] text-white shadow-sm'
                  : 'text-[#5c5246] hover:bg-[#eae2d5]/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="text-xs font-bold text-[#8c7e70] uppercase tracking-wider font-display px-2">
          Showing {filteredNotices.length} {filteredNotices.length === 1 ? 'Announcement' : 'Announcements'}
        </div>
      </div>

      {/* Empty State */}
      {filteredNotices.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white/50 border border-[#eae2d5] rounded shadow-sm max-w-md mx-auto text-center mt-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#a39580] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-bold text-[#3a322b] font-display">No notices to show</h3>
          <p className="text-sm text-[#8c7e70] mt-1 font-medium leading-relaxed">
            There are no active notices published in this category. Click below to add the first announcement.
          </p>
          <Link href="/notices/new" className="btn-primary mt-6 text-xs px-4 py-2 font-display">
            Post Notice
          </Link>
        </div>
      ) : (
        /* Notice Grid: 1 col mobile, 2 col tablet, 3 col desktop */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {filteredNotices.map((notice, idx) => {
            const skewClass = idx % 2 === 0 ? 'skew-card-left' : 'skew-card-right'
            const isUrgent = notice.priority === 'Urgent'

            return (
              <article
                key={notice.id}
                className={`paper-border paper-shadow paper-shadow-hover ${skewClass} bg-white p-6 flex flex-col justify-between min-h-[340px] relative rounded`}
              >
                {/* Pinned pushpin aesthetic */}
                <div className={`pushpin ${isUrgent ? 'pin-urgent' : ''}`} />

                {/* Corner Ribbon for Urgent notices */}
                {isUrgent && <div className="ribbon">Urgent</div>}

                <div>
                  {/* Category and Date Header */}
                  <div className="flex items-center justify-between mb-4 text-xs">
                    <span className="font-bold uppercase tracking-wider text-[#b45309] font-display">
                      {notice.category}
                    </span>
                    <span className="text-[#8c7e70] font-semibold font-display">
                      {mounted ? formatDate(notice.publishDate) : '...'}
                    </span>
                  </div>

                  {/* Optional Image */}
                  {notice.image && (
                    <div className="mb-4 overflow-hidden rounded-sm border border-[#eae2d5] h-40 relative bg-[#faf6ee]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={notice.image}
                        alt={notice.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1572945281861-68b122e3e9d6?w=500&auto=format&fit=crop&q=60'
                        }}
                      />
                    </div>
                  )}

                  {/* Notice Title */}
                  <h2 className="text-xl font-bold text-[#3a322b] leading-tight mb-3 pr-8 font-display">
                    {notice.title}
                  </h2>

                  {/* Notice Content Body */}
                  <p className="text-sm text-[#4a423a] line-clamp-5 whitespace-pre-line leading-relaxed mb-6">
                    {notice.body}
                  </p>
                </div>

                {/* Actions footer */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#f7f4ee]">
                  {confirmingDeleteId === notice.id ? (
                    <div className="flex items-center space-x-2 bg-red-50 border border-red-200 p-2 rounded text-xs font-bold text-red-700 animate-fadeIn font-display">
                      <span>Confirm?</span>
                      <button
                        onClick={() => handleDelete(notice.id)}
                        className="btn-danger text-xs px-2.5 py-1.5"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmingDeleteId(null)}
                        className="btn-secondary text-xs px-2.5 py-1.5"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link
                        href={`/notices/${notice.id}/edit`}
                        className="btn-secondary px-3 py-2 text-xs flex items-center space-x-1"
                        title="Edit Announcement"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => setConfirmingDeleteId(notice.id)}
                        className="btn-secondary px-3 py-2 text-xs hover:text-red-600 hover:border-red-600 flex items-center space-x-1"
                        title="Remove Announcement"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete</span>
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
  )
}
