import { useRouter } from 'next/router'
import NoticeForm from '@/components/NoticeForm'

export default function NewNotice() {
  const router = useRouter()

  const handleSubmit = async (payload) => {
    const res = await fetch('/api/notices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json()
      // Throw error to be caught by the form component and set in state
      throw data
    }

    router.push('/')
  }

  return (
    <div className="min-h-screen board-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-[#2d2824] tracking-tight">
            Post a New Notice
          </h1>
          <p className="text-sm text-[#7a6f62] mt-1 font-medium">
            Publish a new announcement to the school bulletin board.
          </p>
        </div>
        
        <NoticeForm mode="create" onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
