import formidable from 'formidable'
import fs from 'fs'
import { put } from '@vercel/blob'

// Disable Next.js default bodyParser for streaming upload requests
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  const form = formidable({
    multiples: false,
    keepExtensions: true,
  })

  // Wrap in Promise to prevent Next.js from throwing connection resolution warnings
  return new Promise((resolve) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Formidable parsing error:', err)
        res.status(500).json({ error: 'Failed to process the uploaded file.' })
        return resolve()
      }

      // Extract the file (works if formidable parses as single file or array)
      const file = Array.isArray(files.image) ? files.image[0] : files.image
      if (!file) {
        res.status(400).json({ error: 'Please select an image file to upload.' })
        return resolve()
      }

      // Safe property lookups (compatible across formidable v2 and v3)
      const filePath = file.filepath || file.path
      const originalName = file.originalFilename || file.name
      const mimeType = file.mimetype || file.type
      const size = file.size

      // 1. Validate file type (only image/jpeg, image/png, image/webp)
      const validTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!validTypes.includes(mimeType)) {
        res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, and WEBP images are allowed.' })
        return resolve()
      }

      // 2. Validate file size (max 5MB)
      const maxSizeBytes = 5 * 1024 * 1024
      if (size > maxSizeBytes) {
        res.status(400).json({ error: 'File size exceeds the 5MB limit.' })
        return resolve()
      }

      try {
        const fileStream = fs.createReadStream(filePath)
        
        // Upload stream to Vercel Blob with public access
        const blob = await put(originalName || 'upload.jpg', fileStream, {
          access: 'public',
          contentType: mimeType,
        })

        // Return resulting URL
        res.status(200).json({ url: blob.url })
        return resolve()
      } catch (uploadError) {
        console.error('Error uploading to Vercel Blob:', uploadError)
        res.status(500).json({ error: 'Failed to upload image to storage.' })
        return resolve()
      }
    })
  })
}
