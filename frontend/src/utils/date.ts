import { format, parseISO, isValid } from 'date-fns'

export const formatDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return 'Invalid Date'
    return format(dateObj, 'MMM dd, yyyy')
  } catch {
    return 'Invalid Date'
  }
}

export const formatDateTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return 'Invalid Date'
    return format(dateObj, 'MMM dd, yyyy HH:mm')
  } catch {
    return 'Invalid Date'
  }
}

export const formatTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return 'Invalid Time'
    return format(dateObj, 'HH:mm')
  } catch {
    return 'Invalid Time'
  }
}
