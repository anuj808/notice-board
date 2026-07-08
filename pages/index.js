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
    <div className="min-h-screen board-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row items-center justify-between border-b-4 border-[#eae2d5] pb-8 mb-10 gap-6">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#3a322b] tracking-tight font-display">
              School Bulletin Board
            </h1>
            <p className="text-sm sm:text-base text-[#8c7e70] mt-2 font-medium">
              Announcements, events, and schedules posted by staff
            </p>
          </div>
          
          <Link
            href="/notices/new"
            className="flex items-center space-x-2 px-6 py-3 bg-[#d97706] hover:bg-[#b45309] active:bg-[#92400e] text-white text-sm font-bold rounded shadow-md hover:shadow-lg transition duration-150 transform hover:-translate-y-0.5 font-display"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Post New Notice</span>
          </Link>
        </header>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded text-sm font-semibold shadow-sm font-display">
            {error}
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 bg-white/70 backdrop-blur-sm p-4 border border-[#eae2d5] rounded shadow-sm gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#8c7e70] uppercase tracking-wider px-2 font-display">Category Filter:</span>
            {['All', 'General', 'Exam', 'Event'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 text-xs font-bold rounded transition-all duration-150 font-display ${
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
            Total: {filteredNotices.length} {filteredNotices.length === 1 ? 'Notice' : 'Notices'}
          </div>
        </div>

        {/* Notice Board List Grid */}
        {filteredNotices.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white/50 border-2 border-dashed border-[#eae2d5] rounded shadow-sm max-w-xl mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-[#a39580] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg font-bold text-[#3a322b] font-display">No Notices Posted</p>
            <p className="text-sm text-[#8c7e70] mt-1 text-center font-medium leading-relaxed">
              There are no announcements currently published in this category. Use the "Post New Notice" button to publish the first one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredNotices.map((notice, idx) => {
              const skewClass = idx % 2 === 0 ? 'skew-card-left' : 'skew-card-right'
              const isUrgent = notice.priority === 'Urgent'

              return (
                <article
                  key={notice.id}
                  className={`paper-border paper-shadow paper-shadow-hover ${skewClass} bg-white p-6 flex flex-col justify-between min-h-[340px] relative rounded`}
                >
                  {/* Pinned pushpin aesthetic */}
                  <div className={`pushpin ${isUrgent ? 'pin-urgent animate-pulse' : ''}`} />

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
                          className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded shadow-sm transition"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmingDeleteId(null)}
                          className="px-2.5 py-1.5 bg-[#eae2d5] text-[#5c5246] hover:bg-[#dcd6cd] rounded transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <Link
                          href={`/notices/${notice.id}/edit`}
                          className="p-2 text-[#a39580] hover:text-[#b45309] hover:bg-[#faf6ee] border border-[#eae2d5] hover:border-[#b45309] rounded transition duration-150"
                          title="Edit Announcement"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => setConfirmingDeleteId(notice.id)}
                          className="p-2 text-[#a39580] hover:text-red-600 hover:bg-red-50 border border-[#eae2d5] hover:border-red-600 rounded transition duration-150"
                          title="Remove Announcement"
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
