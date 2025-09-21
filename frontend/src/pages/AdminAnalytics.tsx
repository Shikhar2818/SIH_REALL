import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  Heart, 
  TrendingUp, 
  BarChart3, 
  Download,
  Filter,
  RefreshCw,
  MessageCircle,
  Activity,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  FileText,
  Clock,
  UserCheck,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { api } from '../utils/api'
import { formatDate, formatDateTime } from '../utils/date'
import toast from 'react-hot-toast'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface DashboardData {
  userStats: Array<{
    _id: string
    count: number
    activeCount: number
  }>
  bookingStats: Array<{
    _id: string
    count: number
  }>
  recentBookings: Array<{
    _id: string
    studentId: { name: string; email: string } | null
    counsellorId: { name: string; email: string } | null
    status: string
    counsellorNotes?: string
    slotStart: string
    createdAt: string
    updatedAt: string
  }>
  counsellorStats: Array<{
    _id: string
    counsellorName: string
    totalBookings: number
    confirmedBookings: number
    completedBookings: number
    cancelledBookings: number
    noShows: number
    confirmationRate: number
    completionRate: number
  }>
  screeningStats: Array<{
    _id: string
    total: number
    avgScore: number
  }>
  mentalHealthTrends: Array<{
    _id: { date: string; severity: string }
    count: number
    avgScore: number
  }>
  forumStats: Array<{
    _id: string
    count: number
    approvedCount: number
  }>
  moodStats: Array<{
    _id: string
    count: number
  }>
  recentActivity: Array<{
    type: string
    title: string
    timestamp: string
    data: any
  }>
}

const AdminAnalytics = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('30')
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [counsellorNotes, setCounsellorNotes] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/admin-analytics/dashboard')
      setData(response.data)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      toast.error('Failed to fetch analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await api.patch(`/admin-analytics/bookings/${bookingId}/status`, {
        status,
        counsellorNotes
      })
      toast.success('Booking status updated successfully')
      setShowBookingModal(false)
      setCounsellorNotes('')
      fetchData() // Refresh data
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast.error('Failed to update booking status')
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-gray-100 text-gray-800',
      rescheduled: 'bg-purple-100 text-purple-800'
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      completed: UserCheck,
      cancelled: XCircle,
      no_show: AlertCircle,
      rescheduled: RefreshCw
    }
    return icons[status as keyof typeof icons] || Clock
  }

  // Prepare chart data
  const bookingStatusData = {
    labels: data?.bookingStats.map(stat => stat._id.charAt(0).toUpperCase() + stat._id.slice(1)) || [],
    datasets: [{
      data: data?.bookingStats.map(stat => stat.count) || [],
      backgroundColor: [
        '#FCD34D', // yellow for pending
        '#10B981', // green for confirmed
        '#3B82F6', // blue for completed
        '#EF4444', // red for cancelled
        '#6B7280', // gray for no_show
        '#8B5CF6'  // purple for rescheduled
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  }

  const counsellorPerformanceData = {
    labels: data?.counsellorStats.map(stat => stat.counsellorName) || [],
    datasets: [
      {
        label: 'Total Bookings',
        data: data?.counsellorStats.map(stat => stat.totalBookings) || [],
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1
      },
      {
        label: 'Confirmed Bookings',
        data: data?.counsellorStats.map(stat => stat.confirmedBookings) || [],
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1
      }
    ]
  }

  const moodDistributionData = {
    labels: data?.moodStats.map(stat => stat._id.charAt(0).toUpperCase() + stat._id.slice(1)) || [],
    datasets: [{
      data: data?.moodStats.map(stat => stat.count) || [],
      backgroundColor: [
        '#EF4444', // red
        '#F97316', // orange
        '#FCD34D', // yellow
        '#84CC16', // lime
        '#10B981', // green
        '#06B6D4', // cyan
        '#3B82F6', // blue
        '#8B5CF6', // violet
        '#EC4899'  // pink
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load analytics data</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
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
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">
                Real-time platform analytics and booking management
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                <span>Auto Refresh</span>
              </button>
              <button
                onClick={fetchData}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.userStats.reduce((sum, stat) => sum + stat.count, 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.bookingStats.reduce((sum, stat) => sum + stat.count, 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Pending Bookings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.bookingStats.find(stat => stat._id === 'pending')?.count || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Completed Sessions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.bookingStats.find(stat => stat._id === 'completed')?.count || 0}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Booking Status Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status Distribution</h3>
            <div className="h-64">
              <Doughnut 
                data={bookingStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Counsellor Performance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Counsellor Performance</h3>
            <div className="h-64">
              <Bar 
                data={counsellorPerformanceData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Real-time Bookings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          {/* Recent Bookings */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
              <span className="text-sm text-gray-500">Real-time updates</span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {data.recentBookings?.length > 0 ? (
                data.recentBookings.map((booking) => {
                  const StatusIcon = getStatusIcon(booking.status)
                  return (
                    <div
                      key={booking._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedBooking(booking)
                        setShowBookingModal(true)
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <StatusIcon className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.studentId?.name || 'Unknown Student'} → {booking.counsellorId?.name || 'Unknown Counsellor'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDateTime(booking.slotStart)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        {booking.counsellorNotes && (
                          <MessageCircle className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent bookings found</p>
                </div>
              )}
            </div>
          </div>

          {/* Mood Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Distribution</h3>
            <div className="h-64">
              <Doughnut 
                data={moodDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Counsellor Performance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Counsellor Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Counsellor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confirmed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confirmation Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.counsellorStats?.length > 0 ? (
                  data.counsellorStats.map((stat) => (
                  <tr key={stat._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stat.counsellorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.totalBookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.confirmedBookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.completedBookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        stat.confirmationRate >= 80 ? 'bg-green-100 text-green-800' :
                        stat.confirmationRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {stat.confirmationRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        stat.completionRate >= 80 ? 'bg-green-100 text-green-800' :
                        stat.completionRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {stat.completionRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No counsellor performance data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {data.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Activity className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Booking Status Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Update Booking Status</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Student:</p>
                <p className="text-gray-900">{selectedBooking.studentId?.name || 'Unknown Student'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Counsellor:</p>
                <p className="text-gray-900">{selectedBooking.counsellorId?.name || 'Unknown Counsellor'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Current Status:</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Counsellor Notes (Optional)
                </label>
                <textarea
                  value={counsellorNotes}
                  onChange={(e) => setCounsellorNotes(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add notes about this booking..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => updateBookingStatus(selectedBooking._id, 'confirmed')}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => updateBookingStatus(selectedBooking._id, 'cancelled')}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateBookingStatus(selectedBooking._id, 'completed')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminAnalytics
