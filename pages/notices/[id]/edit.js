import { useRouter } from 'next/router'
import NoticeForm from '@/components/NoticeForm'
import { prisma } from '@/lib/prisma'

export async function getServerSideProps(context) {
  try {
    const { id } = context.params
    const noticeId = parseInt(id, 10)

    if (isNaN(noticeId)) {
      return { notFound: true }
    }

    const noticeRaw = await prisma.notice.findUnique({
      where: { id: noticeId }
    })

    if (!noticeRaw) {
      return { notFound: true }
    }

    // Serialize Dates to JSON-safe strings for client props
    const notice = {
      ...noticeRaw,
      publishDate: noticeRaw.publishDate ? noticeRaw.publishDate.toISOString() : null,
      createdAt: noticeRaw.createdAt.toISOString(),
      updatedAt: noticeRaw.updatedAt.toISOString(),
    }

    return {
      props: {
        notice,
      },
    }
  } catch (error) {
    console.error('Error fetching notice for edit:', error)
    return { notFound: true }
  }
}

export default function EditNotice({ notice }) {
  const router = useRouter()

  const handleSubmit = async (payload) => {
    const res = await fetch(`/api/notices/${notice.id}`, {
      method: 'PUT',
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
    <div className="min-h-screen board-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#3a322b] tracking-tight font-display">
            Edit Notice
          </h1>
          <p className="text-sm sm:text-base text-[#8c7e70] mt-2 font-medium">
            Update the notice details on the bulletin board.
          </p>
        </div>
        
        <NoticeForm mode="edit" initialValues={notice} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
