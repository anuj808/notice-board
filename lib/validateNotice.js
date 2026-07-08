/**
 * Validates a notice payload.
 * @param {any} input - The raw request body.
 * @returns {{ isValid: boolean, errors: Record<string, string>, data: any }}
 */
export function validateNotice(input) {
  if (!input || typeof input !== 'object') {
    return {
      isValid: false,
      errors: { _global: 'Request body must be a valid JSON object.' },
      data: {}
    }
  }

  const errors = {}
  const data = {}

  // 1. Validate Title (Required, non-empty after trim)
  if (typeof input.title !== 'string' || input.title.trim() === '') {
    errors.title = 'Title is required and cannot be empty.'
  } else {
    data.title = input.title.trim()
  }

  // 2. Validate Body (Required, non-empty after trim)
  if (typeof input.body !== 'string' || input.body.trim() === '') {
    errors.body = 'Body is required and cannot be empty.'
  } else {
    data.body = input.body.trim()
  }

  // 3. Validate Category (Must be Exam/Event/General, default: General)
  const validCategories = ['Exam', 'Event', 'General']
  if (input.category !== undefined && input.category !== null) {
    if (!validCategories.includes(input.category)) {
      errors.category = `Category must be one of: ${validCategories.join(', ')}.`
    } else {
      data.category = input.category
    }
  } else {
    data.category = 'General'
  }

  // 4. Validate Priority (Must be Normal/Urgent, default: Normal)
  const validPriorities = ['Normal', 'Urgent']
  if (input.priority !== undefined && input.priority !== null) {
    if (!validPriorities.includes(input.priority)) {
      errors.priority = `Priority must be one of: ${validPriorities.join(', ')}.`
    } else {
      data.priority = input.priority
    }
  } else {
    data.priority = 'Normal'
  }

  // 5. Validate PublishDate (Optional, but must parse to valid Date if provided)
  if (input.publishDate !== undefined && input.publishDate !== null && input.publishDate !== '') {
    const timestamp = Date.parse(input.publishDate)
    if (isNaN(timestamp)) {
      errors.publishDate = 'Publish date must be a valid date.'
    } else {
      data.publishDate = new Date(timestamp)
    }
  } else {
    data.publishDate = null
  }

  // 6. Validate Image (Optional URL, must be string if provided)
  if (input.image !== undefined && input.image !== null && input.image !== '') {
    if (typeof input.image !== 'string') {
      errors.image = 'Image must be a string URL.'
    } else {
      data.image = input.image.trim()
    }
  } else {
    data.image = null
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data
  }
}
