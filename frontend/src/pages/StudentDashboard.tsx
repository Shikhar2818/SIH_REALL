import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import { formatDateTime, formatTime } from '../utils/date'
import { 
  Calendar, 
  Heart, 
  BookOpen, 
  MessageCircle, 
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
  Plus,
  Activity
} from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

interface Booking {
  _id: string
  counsellorId: {
    _id: string
    name: string
    email: string
  }
  slotStart: string
  slotEnd: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
}

interface Screening {
  _id: string
  type: 'PHQ9' | 'GAD7'
  totalScore: number
  severity: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe'
  createdAt: string
}

interface ForumPost {
  _id: string
  title: string
  category: string
  mood?: string
  likes: any[]
  comments: any[]
  createdAt: string
}

const StudentDashboard = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [recentPosts, setRecentPosts] = useState<ForumPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch user's bookings
      const bookingsResponse = await api.get('/bookings/my-bookings')
      setBookings(bookingsResponse.data.bookings)

      // Fetch user's screening history
      const screeningsResponse = await api.get('/screenings/history')
      setScreenings(screeningsResponse.data.screenings)

      // Fetch user's forum posts
      const forumResponse = await api.get('/forum/my-posts')
      setRecentPosts(forumResponse.data.posts.slice(0, 3))

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const getUpcomingBookings = () => {
    return bookings
      .filter(booking => 
        booking.status === 'pending' || booking.status === 'confirmed'
      )
      .filter(booking => new Date(booking.slotStart) > new Date())
      .sort((a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime())
      .slice(0, 3)
  }

  const getRecentActivity = () => {
    const activities = []
    
    // Add booking activities
    bookings.slice(0, 3).forEach(booking => {
      activities.push({
        id: `booking-${booking._id}`,
        type: 'booking',
        title: `Appointment with ${booking.counsellorId.name}`,
        description: `Status: ${booking.status}`,
        time: booking.createdAt,
        icon: Calendar,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      })
    })

    // Add screening activities
    screenings.slice(0, 3).forEach(screening => {
      activities.push({
        id: `screening-${screening._id}`,
        type: 'screening',
        title: `Completed ${screening.type} Assessment`,
        description: `Severity: ${screening.severity}`,
        time: screening.createdAt,
        icon: Heart,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      })
    })

    // Add forum activities
    recentPosts.forEach(post => {
      activities.push({
        id: `post-${post._id}`,
        type: 'forum',
        title: `Posted: ${post.title}`,
        description: `Category: ${post.category}`,
        time: post.createdAt,
        icon: Users,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
      })
    })

    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5)
  }

  const getStats = () => {
    const upcomingBookings = getUpcomingBookings().length
    const completedScreenings = screenings.length
    const totalBookings = bookings.length
    const forumPosts = recentPosts.length

    return {
      upcomingBookings,
      completedScreenings,
      totalBookings,
      forumPosts,
    }
  }

  const stats = getStats()
  const upcomingBookings = getUpcomingBookings()
  const recentActivity = getRecentActivity()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's an overview of your mental health journey
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingBookings}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Screenings Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedScreenings}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Community Posts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.forumPosts}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/bookings"
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Book Appointment</h3>
                      <p className="text-sm text-gray-600">Schedule with a counsellor</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/screening"
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Take Screening</h3>
                      <p className="text-sm text-gray-600">Mental health assessment</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/resources"
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Browse Resources</h3>
                      <p className="text-sm text-gray-600">Educational materials</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/peer-community"
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Peer Community</h3>
                      <p className="text-sm text-gray-600">Connect with others</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent activity</p>
                  <p className="text-sm text-gray-500">Start by booking an appointment or taking a screening</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 ${activity.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDateTime(activity.time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Upcoming Appointments */}
        {upcomingBookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8"
          >
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
                <Link
                  to="/bookings"
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  View all
                </Link>
              </div>
              
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Session with {booking.counsellorId.name}</p>
                        <p className="text-sm text-gray-600">{formatDateTime(booking.slotStart)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(booking.slotStart)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Mental Health Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-8"
        >
          <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-xl p-8 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-6 h-6" />
              <h3 className="text-xl font-semibold">Mental Health Tip</h3>
            </div>
            <p className="text-primary-100 mb-4">
              "Regular physical exercise can significantly improve your mood and reduce symptoms of anxiety and depression. Try to incorporate at least 30 minutes of moderate exercise into your daily routine."
            </p>
            <div className="flex items-center space-x-2 text-sm text-primary-200">
              <Users className="w-4 h-4" />
              <span>Recommended by our counsellors</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default StudentDashboard
