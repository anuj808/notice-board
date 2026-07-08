import { prisma } from '@/lib/prisma'
import { validateNotice } from '@/lib/validateNotice'

export default async function handler(req, res) {
  try {
    // 1. GET handler: Return all notices ordered by priority DESC (Urgent first), then by publishDate DESC
    if (req.method === 'GET') {
      const notices = await prisma.notice.findMany({
        orderBy: [
          { priority: 'desc' },
          { publishDate: 'desc' }
        ]
      })
      return res.status(200).json(notices)
    }

    // 2. POST handler: Create a new notice with server-side validation
    if (req.method === 'POST') {
      const { isValid, errors, data } = validateNotice(req.body)

      if (!isValid) {
        return res.status(400).json({ errors })
      }

      const createdNotice = await prisma.notice.create({
        data
      })

      return res.status(201).json(createdNotice)
    }

    // Handle any other HTTP methods
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  } catch (error) {
    console.error('API Error in /api/notices:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
