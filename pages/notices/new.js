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
      throw data
    }

    router.push('/')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-[#3a322b] tracking-tight font-display">
          Post a New Notice
        </h1>
        <p className="text-sm text-[#8c7e70] mt-2 font-medium">
          Publish a new announcement to the school bulletin board.
        </p>
      </div>
      
      <NoticeForm mode="create" onSubmit={handleSubmit} />
    </div>
  )
}
