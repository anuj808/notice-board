import { useState, useEffect } from 'react'
import Link from 'next/link'

/**
 * Helper to format ISO date string for datetime-local input (YYYY-MM-DDTHH:MM)
 * using local timezone to prevent offset shifts.
 */
const formatForInput = (dateStr) => {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch (e) {
    return ''
  }
}

export default function NoticeForm({ mode, initialValues, onSubmit }) {
  const [values, setValues] = useState({
    title: initialValues?.title || '',
    body: initialValues?.body || '',
    category: initialValues?.category || 'General',
    priority: initialValues?.priority || 'Normal',
    publishDate: formatForInput(initialValues?.publishDate),
  })

  // File upload states
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(initialValues?.image || '')
  const [shouldRemoveImage, setShouldRemoveImage] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Validation and error states
  const [clientErrors, setClientErrors] = useState({})
  const [serverErrors, setServerErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Revoke object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (serverErrors[name]) {
      setServerErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size clientside for early UX feedback
      if (file.size > 5 * 1024 * 1024) {
        setClientErrors((prev) => ({ ...prev, image: 'File size exceeds the 5MB limit.' }))
        return
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setClientErrors((prev) => ({ ...prev, image: 'Only JPEG, PNG, and WEBP formats are allowed.' }))
        return
      }

      setClientErrors((prev) => ({ ...prev, image: null }))
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setShouldRemoveImage(false)
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setShouldRemoveImage(true)
    if (clientErrors.image) {
      setClientErrors((prev) => ({ ...prev, image: null }))
    }
  }

  const validate = () => {
    const errs = {}
    if (!values.title.trim()) {
      errs.title = 'Title is required.'
    }
    if (!values.body.trim()) {
      errs.body = 'Content body is required.'
    }
    if (values.publishDate && isNaN(Date.parse(values.publishDate))) {
      errs.publishDate = 'Please select a valid date and time.'
    }
    setClientErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerErrors({})
    
    if (!validate()) return

    setIsSubmitting(true)
    let finalImageUrl = initialValues?.image || null

    try {
      // 1. First upload the file if a new file was selected
      if (selectedFile) {
        setIsUploading(true)
        const formData = new FormData()
        formData.append('image', selectedFile)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) {
          const errData = await uploadRes.json()
          throw new Error(errData.error || 'Failed to upload image.')
        }

        const { url } = await uploadRes.json()
        finalImageUrl = url
        setIsUploading(false)
      } else if (shouldRemoveImage) {
        finalImageUrl = null
      }

      // 2. Submit the notice payload with the resulting Blob URL
      const payload = {
        ...values,
        publishDate: values.publishDate ? new Date(values.publishDate).toISOString() : null,
        image: finalImageUrl,
      }
      await onSubmit(payload)
    } catch (err) {
      setIsUploading(false)
      if (err.errors) {
        setServerErrors(err.errors)
      } else {
        setServerErrors({ _global: err.message || 'An unexpected error occurred during saving.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-white p-8 border border-[#eae2d5] rounded shadow-md relative">
      {/* Decorative metal pin in headers */}
      <div className="pushpin bg-[#d97706]" />

      {serverErrors._global && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded text-sm font-semibold">
          {serverErrors._global}
        </div>
      )}

      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-[#5c5246] mb-1 font-display">
          Notice Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={values.title}
          onChange={handleChange}
          placeholder="e.g., Final Exam Timetable Released"
          className={`w-full px-4 py-2.5 border rounded text-[#2d2824] bg-[#fdfdfd] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent transition duration-150 ${
            clientErrors.title || serverErrors.title ? 'border-red-300 ring-2 ring-red-100' : 'border-[#eae2d5]'
          }`}
        />
        {(clientErrors.title || serverErrors.title) && (
          <p className="mt-1.5 text-xs text-red-600 font-semibold">
            {clientErrors.title || serverErrors.title}
          </p>
        )}
      </div>

      {/* Body Field */}
      <div>
        <label htmlFor="body" className="block text-xs font-bold uppercase tracking-wider text-[#5c5246] mb-1 font-display">
          Notice Content <span className="text-red-500">*</span>
        </label>
        <textarea
          id="body"
          name="body"
          rows="6"
          value={values.body}
          onChange={handleChange}
          placeholder="Write the full announcement text here..."
          className={`w-full px-4 py-2.5 border rounded text-[#2d2824] bg-[#fdfdfd] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent transition duration-150 leading-relaxed ${
            clientErrors.body || serverErrors.body ? 'border-red-300 ring-2 ring-red-100' : 'border-[#eae2d5]'
          }`}
        />
        {(clientErrors.body || serverErrors.body) && (
          <p className="mt-1.5 text-xs text-red-600 font-semibold">
            {clientErrors.body || serverErrors.body}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Field */}
        <div>
          <label htmlFor="category" className="block text-xs font-bold uppercase tracking-wider text-[#5c5246] mb-1 font-display">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={values.category}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-[#eae2d5] rounded text-[#2d2824] bg-[#fdfdfd] focus:outline-none focus:ring-2 focus:ring-[#d97706] transition duration-150"
          >
            <option value="General">General</option>
            <option value="Exam">Exam</option>
            <option value="Event">Event</option>
          </select>
          {serverErrors.category && (
            <p className="mt-1.5 text-xs text-red-600 font-semibold">{serverErrors.category}</p>
          )}
        </div>

        {/* Priority Field */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#5c5246] mb-2 font-display">
            Priority Level
          </label>
          <div className="flex items-center space-x-6 py-2">
            <label className="flex items-center space-x-2 text-sm text-[#4a423a] cursor-pointer">
              <input
                type="radio"
                name="priority"
                value="Normal"
                checked={values.priority === 'Normal'}
                onChange={handleChange}
                className="w-4 h-4 text-[#d97706] border-[#eae2d5] focus:ring-[#d97706]"
              />
              <span>Normal</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-red-700 font-bold cursor-pointer">
              <input
                type="radio"
                name="priority"
                value="Urgent"
                checked={values.priority === 'Urgent'}
                onChange={handleChange}
                className="w-4 h-4 text-red-600 border-[#eae2d5] focus:ring-red-600"
              />
              <span>Urgent</span>
            </label>
          </div>
          {serverErrors.priority && (
            <p className="mt-1.5 text-xs text-red-600 font-semibold">{serverErrors.priority}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Publish Date Field */}
        <div>
          <label htmlFor="publishDate" className="block text-xs font-bold uppercase tracking-wider text-[#5c5246] mb-1 font-display">
            Publish Date & Time (Optional)
          </label>
          <input
            type="datetime-local"
            id="publishDate"
            name="publishDate"
            value={values.publishDate}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded text-[#2d2824] bg-[#fdfdfd] focus:outline-none focus:ring-2 focus:ring-[#d97706] transition duration-150 ${
              clientErrors.publishDate || serverErrors.publishDate ? 'border-red-300 ring-2 ring-red-100' : 'border-[#eae2d5]'
            }`}
          />
          {(clientErrors.publishDate || serverErrors.publishDate) && (
            <p className="mt-1.5 text-xs text-red-600 font-semibold">
              {clientErrors.publishDate || serverErrors.publishDate}
            </p>
          )}
        </div>

        {/* File Upload Field */}
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-[#5c5246] mb-1 font-display">
            Notice Image (Optional, max 5MB)
          </span>
          
          {previewUrl ? (
            <div className="relative mt-1 group border border-[#eae2d5] rounded p-2 bg-[#faf6ee] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Selected Preview"
                  className="w-16 h-16 object-cover rounded border border-[#eae2d5]"
                />
                <span className="text-xs font-semibold text-[#8c7e70]">
                  {selectedFile ? selectedFile.name : 'Current Image'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded transition font-display border border-transparent hover:border-red-200"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded transition duration-150 bg-[#fafaf9] ${
              clientErrors.image ? 'border-red-300 bg-red-50/10' : 'border-[#eae2d5] hover:border-[#d97706]'
            }`}>
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-10 w-10 text-[#a39580]" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h16m8-8V12a4 4 0 00-4-4h-4M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4-4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded font-bold text-[#d97706] hover:text-[#b45309] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#d97706]">
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                <p className="text-2xs text-[#8c7e70] font-medium">PNG, JPG, WEBP up to 5MB</p>
              </div>
            </div>
          )}
          {(clientErrors.image || serverErrors.image) && (
            <p className="mt-1.5 text-xs text-red-600 font-semibold">
              {clientErrors.image || serverErrors.image}
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end space-x-4 pt-5 border-t border-[#eae2d5]">
        <Link
          href="/"
          className="px-5 py-2.5 text-sm font-semibold text-[#5c5246] hover:text-[#b45309] border border-[#eae2d5] hover:border-[#b45309] rounded transition duration-150 bg-white"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="px-6 py-2.5 text-sm font-bold text-white bg-[#d97706] hover:bg-[#b45309] active:bg-[#92400e] focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed rounded shadow transition duration-150 font-display"
        >
          {isSubmitting || isUploading ? 'Uploading...' : mode === 'edit' ? 'Update Notice' : 'Post Notice'}
        </button>
      </div>
    </form>
  )
}
