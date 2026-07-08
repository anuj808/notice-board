import { prisma } from '@/lib/prisma'
import { validateNotice } from '@/lib/validateNotice'

export default async function handler(req, res) {
  try {
    const { id } = req.query
    const noticeId = parseInt(id, 10)

    if (isNaN(noticeId)) {
      return res.status(400).json({ error: 'Invalid notice ID.' })
    }

    // 1. GET handler: Fetch single notice by ID
    if (req.method === 'GET') {
      const notice = await prisma.notice.findUnique({
        where: { id: noticeId }
      })

      if (!notice) {
        return res.status(404).json({ error: 'Notice not found.' })
      }

      return res.status(200).json(notice)
    }

    // 2. PUT handler: Update notice by ID with validation
    if (req.method === 'PUT') {
      // Check if notice exists first
      const existingNotice = await prisma.notice.findUnique({
        where: { id: noticeId }
      })

      if (!existingNotice) {
        return res.status(404).json({ error: 'Notice not found.' })
      }

      const { isValid, errors, data } = validateNotice(req.body)

      if (!isValid) {
        return res.status(400).json({ errors })
      }

      const updatedNotice = await prisma.notice.update({
        where: { id: noticeId },
        data
      })

      return res.status(200).json(updatedNotice)
    }

    // 3. DELETE handler: Delete notice by ID
    if (req.method === 'DELETE') {
      // Check if notice exists first
      const existingNotice = await prisma.notice.findUnique({
        where: { id: noticeId }
      })

      if (!existingNotice) {
        return res.status(404).json({ error: 'Notice not found.' })
      }

      await prisma.notice.delete({
        where: { id: noticeId }
      })

      return res.status(204).end()
    }

    // Handle any other HTTP methods
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  } catch (error) {
    console.error(`API Error in /api/notices/${req.query.id}:`, error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
