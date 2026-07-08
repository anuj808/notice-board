import { useState } from 'react'
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
    image: initialValues?.image || '',
  })

  const [clientErrors, setClientErrors] = useState({})
  const [serverErrors, setServerErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    // Clear validation error when typing
    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (serverErrors[name]) {
      setServerErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const errs = {}
    if (!values.title.trim()) {
      errs.title = 'Title is required.'
    }
    if (!values.body.trim()) {
      errs.body = 'Body is required and cannot be empty.'
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
    try {
      // Prepare payload (convert empty dates or images to null for database)
      const payload = {
        ...values,
        publishDate: values.publishDate ? new Date(values.publishDate).toISOString() : null,
        image: values.image.trim() || null,
      }
      await onSubmit(payload)
    } catch (err) {
      if (err.errors) {
        setServerErrors(err.errors)
      } else {
        setServerErrors({ _global: err.message || 'An unexpected error occurred.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-white p-8 border border-[#eae2d5] rounded-lg shadow-sm">
      {serverErrors._global && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded text-sm font-medium">
          {serverErrors._global}
        </div>
      )}

      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-[#4a423a] mb-1">
          Notice Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={values.title}
          onChange={handleChange}
          placeholder="e.g. Annual Sports Day Postponed"
          className={`w-full px-4 py-2 border rounded-md text-[#2d2824] bg-[#fafaf9] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8c7a6b] focus:border-transparent transition duration-150 ${
            clientErrors.title || serverErrors.title ? 'border-red-300 ring-2 ring-red-100' : 'border-[#dcd6cd]'
          }`}
        />
        {(clientErrors.title || serverErrors.title) && (
          <p className="mt-1 text-xs text-red-600 font-medium">
            {clientErrors.title || serverErrors.title}
          </p>
        )}
      </div>

      {/* Body Field */}
      <div>
        <label htmlFor="body" className="block text-sm font-semibold text-[#4a423a] mb-1">
          Notice Content <span className="text-red-500">*</span>
        </label>
        <textarea
          id="body"
          name="body"
          rows="6"
          value={values.body}
          onChange={handleChange}
          placeholder="Enter the notice details here..."
          className={`w-full px-4 py-2 border rounded-md text-[#2d2824] bg-[#fafaf9] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8c7a6b] focus:border-transparent transition duration-150 ${
            clientErrors.body || serverErrors.body ? 'border-red-300 ring-2 ring-red-100' : 'border-[#dcd6cd]'
          }`}
        />
        {(clientErrors.body || serverErrors.body) && (
          <p className="mt-1 text-xs text-red-600 font-medium">
            {clientErrors.body || serverErrors.body}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Field */}
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-[#4a423a] mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={values.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-[#dcd6cd] rounded-md text-[#2d2824] bg-[#fafaf9] focus:outline-none focus:ring-2 focus:ring-[#8c7a6b] transition duration-150"
          >
            <option value="General">General</option>
            <option value="Exam">Exam</option>
            <option value="Event">Event</option>
          </select>
          {serverErrors.category && (
            <p className="mt-1 text-xs text-red-600 font-medium">{serverErrors.category}</p>
          )}
        </div>

        {/* Priority Field */}
        <div>
          <label className="block text-sm font-semibold text-[#4a423a] mb-2">
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
                className="w-4 h-4 text-[#8c7a6b] border-[#dcd6cd] focus:ring-[#8c7a6b]"
              />
              <span>Normal</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-red-600 font-semibold cursor-pointer">
              <input
                type="radio"
                name="priority"
                value="Urgent"
                checked={values.priority === 'Urgent'}
                onChange={handleChange}
                className="w-4 h-4 text-red-600 border-[#dcd6cd] focus:ring-red-500"
              />
              <span>Urgent</span>
            </label>
          </div>
          {serverErrors.priority && (
            <p className="mt-1 text-xs text-red-600 font-medium">{serverErrors.priority}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Publish Date Field */}
        <div>
          <label htmlFor="publishDate" className="block text-sm font-semibold text-[#4a423a] mb-1">
            Publish Date & Time (Optional)
          </label>
          <input
            type="datetime-local"
            id="publishDate"
            name="publishDate"
            value={values.publishDate}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md text-[#2d2824] bg-[#fafaf9] focus:outline-none focus:ring-2 focus:ring-[#8c7a6b] transition duration-150 ${
              clientErrors.publishDate || serverErrors.publishDate ? 'border-red-300 ring-2 ring-red-100' : 'border-[#dcd6cd]'
            }`}
          />
          {(clientErrors.publishDate || serverErrors.publishDate) && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              {clientErrors.publishDate || serverErrors.publishDate}
            </p>
          )}
        </div>

        {/* Image URL Field */}
        <div>
          <label htmlFor="image" className="block text-sm font-semibold text-[#4a423a] mb-1">
            Image URL (Optional)
          </label>
          <input
            type="text"
            id="image"
            name="image"
            value={values.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className={`w-full px-4 py-2 border rounded-md text-[#2d2824] bg-[#fafaf9] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8c7a6b] transition duration-150 ${
              clientErrors.image || serverErrors.image ? 'border-red-300 ring-2 ring-red-100' : 'border-[#dcd6cd]'
            }`}
          />
          {(clientErrors.image || serverErrors.image) && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              {clientErrors.image || serverErrors.image}
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-[#eae2d5]">
        <Link
          href="/"
          className="px-5 py-2 text-sm font-medium text-[#7a6f62] hover:text-[#2d2824] border border-[#dcd6cd] hover:border-[#7a6f62] rounded-md transition duration-150 bg-white"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 text-sm font-semibold text-white bg-[#5c4d3c] hover:bg-[#45392b] disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition duration-150"
        >
          {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Notice' : 'Post Notice'}
        </button>
      </div>
    </form>
  )
}
