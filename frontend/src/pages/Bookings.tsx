import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, MapPin, Plus, Filter } from 'lucide-react'
import { api } from '../utils/api'
import { formatDateTime, formatTime } from '../utils/date'
import toast from 'react-hot-toast'

interface Counsellor {
  _id: string
  name: string
  email: string
  languages: string[]
  availabilitySlots: {
    dayOfWeek: number
    startTime: string
    endTime: string
  }[]
}

interface Booking {
  _id: string
  counsellorId: Counsellor
  slotStart: string
  slotEnd: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
  createdAt: string
}

const Bookings = () => {
  const [counsellors, setCounsellors] = useState<Counsellor[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedCounsellor, setSelectedCounsellor] = useState<Counsellor | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchCounsellors()
    fetchBookings()
  }, [])

  const fetchCounsellors = async () => {
    try {
      const response = await api.get('/counsellors')
      setCounsellors(response.data.counsellors)
    } catch (error) {
      toast.error('Failed to fetch counsellors')
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my-bookings')
      setBookings(response.data.bookings)
    } catch (error) {
      toast.error('Failed to fetch bookings')
    }
  }

  const fetchAvailableSlots = async (counsellorId: string, date: string) => {
    try {
      const response = await api.get(`/counsellors/${counsellorId}/availability?date=${date}`)
      setAvailableSlots(response.data.availableSlots)
    } catch (error) {
      toast.error('Failed to fetch available slots')
    }
  }

  const handleCounsellorSelect = (counsellor: Counsellor) => {
    setSelectedCounsellor(counsellor)
    setShowBookingForm(true)
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    if (selectedCounsellor) {
      fetchAvailableSlots(selectedCounsellor._id, date)
    }
  }

  const handleSlotBook = async (slot: any) => {
    if (!selectedCounsellor) return

    setIsLoading(true)
    try {
      await api.post('/bookings', {
        counsellorId: selectedCounsellor._id,
        slotStart: slot.start,
        slotEnd: slot.end,
      })
      toast.success('Booking created successfully!')
      setShowBookingForm(false)
      fetchBookings()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create booking')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await api.patch(`/bookings/${bookingId}/cancel`)
      toast.success('Booking cancelled successfully!')
      fetchBookings()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel booking')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookings</h1>
          <p className="text-gray-600">
            Schedule appointments with our qualified counsellors
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Counsellors List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Available Counsellors</h2>
                <button className="flex items-center space-x-2 text-primary-600 hover:text-primary-700">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Filter</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {counsellors.map((counsellor) => (
                  <div
                    key={counsellor._id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{counsellor.name}</h3>
                          <p className="text-sm text-gray-600">{counsellor.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Languages:</p>
                      <div className="flex flex-wrap gap-1">
                        {counsellor.languages.map((language) => (
                          <span
                            key={language}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCounsellorSelect(counsellor)}
                      className="w-full btn-primary text-sm"
                    >
                      Book Appointment
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* My Bookings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">My Bookings</h2>
              
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No bookings yet</p>
                  <p className="text-sm text-gray-500">Book your first appointment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {booking.counsellorId.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatDateTime(booking.slotStart)}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(booking.slotStart)} - {formatTime(booking.slotEnd)}</span>
                      </div>

                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Booking Modal */}
        {showBookingForm && selectedCounsellor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Book with {selectedCounsellor.name}
                </h3>
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateSelect(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field"
                  />
                </div>

                {selectedDate && availableSlots.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Times
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => handleSlotBook(slot)}
                          disabled={isLoading}
                          className="p-2 text-sm border border-gray-300 rounded hover:border-primary-300 hover:bg-primary-50 disabled:opacity-50"
                        >
                          {formatTime(slot.start)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDate && availableSlots.length === 0 && (
                  <p className="text-sm text-gray-600 text-center py-4">
                    No available slots for this date
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Bookings
