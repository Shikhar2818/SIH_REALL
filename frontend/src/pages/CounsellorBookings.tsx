import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Filter,
  Search,
  Eye,
  MessageSquare,
  Star
} from 'lucide-react'

interface Booking {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  slotStart: string
  slotEnd: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'rescheduled'
  notes?: string
  counsellorNotes?: string
  sessionSummary?: string
  cancellationReason?: string
  rescheduleReason?: string
  isNoShow: boolean
  actualStartTime?: string
  actualEndTime?: string
  createdAt: string
  updatedAt: string
}

const CounsellorBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, statusFilter])

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        console.error('No authentication token found')
        return
      }

      const response = await fetch('http://localhost:3001/api/counsellor/extended/all-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const bookingsData = await response.json()
        setBookings(bookingsData.bookings || [])
      } else {
        console.error('Failed to fetch bookings:', response.status)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = bookings

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    setFilteredBookings(filtered)
  }

  const handleBookingAction = async (bookingId: string, action: string, notes?: string) => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return

      let endpoint = ''
      let method = 'PATCH'
      let body: any = {}

      switch (action) {
        case 'approve':
          endpoint = `http://localhost:3001/api/counsellor/extended/bookings/${bookingId}/approve`
          body = { notes }
          break
        case 'reject':
          endpoint = `http://localhost:3001/api/counsellor/extended/bookings/${bookingId}/reject`
          body = { reason: notes || 'No reason provided' }
          break
        case 'complete':
          endpoint = `http://localhost:3001/api/counsellor/extended/bookings/${bookingId}/complete`
          body = { sessionSummary: notes }
          break
        case 'no-show':
          endpoint = `http://localhost:3001/api/counsellor/extended/bookings/${bookingId}/no-show`
          body = { reason: notes || 'No show' }
          break
        case 'reschedule':
          endpoint = `http://localhost:3001/api/counsellor/extended/bookings/${bookingId}/reschedule`
          // For reschedule, we need more data - this would typically be handled by a separate modal
          body = { reason: notes || 'Rescheduled by counsellor' }
          break
        default:
          return
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`Booking ${action} successful:`, result.message)
        await fetchBookings() // Refresh bookings
        setShowModal(false)
        setSelectedBooking(null)
        // Show success message
        alert(`Booking ${action}d successfully!`)
      } else {
        const errorText = await response.text()
        console.error(`Failed to ${action} booking:`, errorText)
        alert(`Failed to ${action} booking: ${errorText}`)
      }
    } catch (error) {
      console.error(`Error ${action} booking:`, error)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'no_show': return 'bg-orange-100 text-orange-800'
      case 'rescheduled': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'completed': return <Star className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      case 'no_show': return <AlertCircle className="w-4 h-4" />
      case 'rescheduled': return <Calendar className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getActionButtons = (booking: Booking) => {
    const buttons = []

    if (booking.status === 'pending') {
      buttons.push(
        <button
          key="approve"
          onClick={() => {
            setSelectedBooking(booking)
            setShowModal(true)
          }}
          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
        >
          Approve
        </button>
      )
      buttons.push(
        <button
          key="reject"
          onClick={() => {
            setSelectedBooking(booking)
            setShowModal(true)
          }}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
        >
          Reject
        </button>
      )
    }

    if (booking.status === 'confirmed') {
      buttons.push(
        <button
          key="complete"
          onClick={() => {
            setSelectedBooking(booking)
            setShowModal(true)
          }}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Complete
        </button>
      )
      buttons.push(
        <button
          key="no-show"
          onClick={() => {
            setSelectedBooking(booking)
            setShowModal(true)
          }}
          className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
        >
          No Show
        </button>
      )
    }

    return buttons
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-gray-600">
            Manage your counselling sessions and appointments
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by student name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </div>
          </div>
        </motion.div>

        {/* Bookings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow overflow-hidden"
        >
          {filteredBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.studentName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.studentEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(booking.slotStart).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(booking.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {new Date(booking.slotEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1 capitalize">{booking.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {booking.notes || 'No notes'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedBooking(booking)
                              setShowModal(true)
                            }}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {getActionButtons(booking)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'You don\'t have any bookings yet.'}
              </p>
            </div>
          )}
        </motion.div>

        {/* Action Modal */}
        {showModal && selectedBooking && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Booking Action
                  </h3>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setSelectedBooking(null)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Student:</strong> {selectedBooking.studentName}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Date:</strong> {new Date(selectedBooking.slotStart).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Time:</strong> {new Date(selectedBooking.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Notes (Optional)
                  </label>
                  <textarea
                    id="bookingNotes"
                    rows={3}
                    placeholder="Add any notes about this session..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setSelectedBooking(null)
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  {selectedBooking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          const notes = (document.getElementById('bookingNotes') as HTMLTextAreaElement)?.value
                          handleBookingAction(selectedBooking._id, 'approve', notes)
                        }}
                        disabled={actionLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => {
                          const notes = (document.getElementById('bookingNotes') as HTMLTextAreaElement)?.value
                          handleBookingAction(selectedBooking._id, 'reject', notes)
                        }}
                        disabled={actionLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionLoading ? 'Processing...' : 'Reject'}
                      </button>
                    </>
                  )}
                  {selectedBooking.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        const notes = (document.getElementById('bookingNotes') as HTMLTextAreaElement)?.value
                        handleBookingAction(selectedBooking._id, 'complete', notes)
                      }}
                      disabled={actionLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Complete'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CounsellorBookings
