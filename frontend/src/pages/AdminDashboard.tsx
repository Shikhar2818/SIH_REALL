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
  FileText
} from 'lucide-react'
import { api } from '../utils/api'
import { formatDate, formatDateTime } from '../utils/date'
import toast from 'react-hot-toast'

interface PlatformStats {
  users: {
    total: number
    active: number
    students: number
    counsellors: number
    admins: number
  }
  bookings: {
    total: number
    pending: number
    confirmed: number
    completed: number
  }
  screenings: {
    total: number
    recent: number
  }
  forum: {
    totalPosts: number
    approvedPosts: number
  }
  mentalHealthInsights: Array<{
    _id: string
    count: number
    avgScore: number
  }>
  moodInsights: Array<{
    _id: string
    count: number
  }>
  categoryInsights: Array<{
    _id: string
    count: number
  }>
  recentActivity: Array<{
    _id: string
    title: string
    category: string
    mood?: string
    authorId: {
      name: string
    }
    createdAt: string
  }>
}

interface MentalHealthAnalytics {
  timeframe: number
  screeningAnalytics: Array<{
    _id: {
      type: string
      severity: string
      date: string
    }
    count: number
    avgScore: number
  }>
  moodAnalytics: Array<{
    _id: {
      mood: string
      date: string
    }
    count: number
  }>
  concernAnalytics: Array<{
    _id: {
      category: string
      date: string
    }
    count: number
  }>
}

const AdminDashboard = () => {
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [mentalHealthAnalytics, setMentalHealthAnalytics] = useState<MentalHealthAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('30')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (selectedTimeframe) {
      fetchMentalHealthAnalytics()
    }
  }, [selectedTimeframe])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/stats')
      setPlatformStats(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMentalHealthAnalytics = async () => {
    try {
      const response = await api.get(`/admin/analytics/mental-health?timeframe=${selectedTimeframe}`)
      setMentalHealthAnalytics(response.data)
    } catch (error) {
      console.error('Failed to fetch mental health analytics:', error)
      toast.error('Failed to load mental health analytics')
    }
  }

  const handleRefresh = () => {
    setIsLoading(true)
    fetchDashboardData()
    fetchMentalHealthAnalytics()
  }

  const handleExportData = () => {
    // Create CSV data for export
    const csvData = [
      ['Metric', 'Value'],
      ['Total Users', platformStats?.users.total || 0],
      ['Active Users', platformStats?.users.active || 0],
      ['Students', platformStats?.users.students || 0],
      ['Counsellors', platformStats?.users.counsellors || 0],
      ['Total Bookings', platformStats?.bookings.total || 0],
      ['Total Screenings', platformStats?.screenings.total || 0],
      ['Forum Posts', platformStats?.forum.totalPosts || 0],
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `platform-stats-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast.success('Data exported successfully!')
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      minimal: 'text-green-600 bg-green-100',
      mild: 'text-yellow-600 bg-yellow-100',
      moderate: 'text-orange-600 bg-orange-100',
      moderately_severe: 'text-red-600 bg-red-100',
      severe: 'text-red-800 bg-red-200',
    }
    return colors[severity] || 'text-gray-600 bg-gray-100'
  }

  const getMoodEmoji = (mood: string) => {
    const emojis: Record<string, string> = {
      happy: '😊',
      calm: '😌',
      anxious: '😰',
      stressed: '😤',
      sad: '😢',
      overwhelmed: '😵',
    }
    return emojis[mood] || '😐'
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-gray-100 text-gray-800',
      anxiety: 'bg-yellow-100 text-yellow-800',
      depression: 'bg-blue-100 text-blue-800',
      stress: 'bg-red-100 text-red-800',
      support: 'bg-green-100 text-green-800',
      achievement: 'bg-purple-100 text-purple-800',
    }
    return colors[category] || colors.general
  }

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">
                Overview of platform usage and mental health insights
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleExportData}
                className="btn-primary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {platformStats?.users.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-blue-600 font-medium">
                {platformStats?.users.active || 0} active
              </span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Screenings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {platformStats?.screenings.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600 font-medium">
                +{platformStats?.screenings.recent || 0} this month
              </span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {platformStats?.bookings.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-blue-600 font-medium">
                {platformStats?.bookings.pending || 0} pending
              </span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Community Posts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {platformStats?.forum.totalPosts || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600 font-medium">
                {platformStats?.forum.approvedPosts || 0} approved
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mental Health Insights */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Mental Health Insights</h2>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Screening Severity Distribution</h3>
                  <div className="space-y-2">
                    {platformStats?.mentalHealthInsights.map((insight, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(insight._id)}`}>
                          {insight._id.replace('_', ' ')}
                        </span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">{insight.count} responses</span>
                          <span className="text-sm font-medium text-gray-900">
                            Avg: {insight.avgScore.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Community Mood Insights</h3>
                  <div className="space-y-2">
                    {platformStats?.moodInsights.map((mood, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getMoodEmoji(mood._id)}</span>
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {mood._id}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">{mood.count} posts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Community Analytics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Community Analytics</h2>
                <button className="flex items-center space-x-2 text-primary-600 hover:text-primary-700">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm">View Details</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Concern Categories</h3>
                  <div className="space-y-2">
                    {platformStats?.categoryInsights.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category._id)}`}>
                          {category._id}
                        </span>
                        <span className="text-sm text-gray-600">{category.count} posts</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Booking Status</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">
                        {platformStats?.bookings.pending || 0}
                      </div>
                      <div className="text-sm text-blue-800">Pending</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">
                        {platformStats?.bookings.confirmed || 0}
                      </div>
                      <div className="text-sm text-green-800">Confirmed</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-xl font-bold text-purple-600">
                        {platformStats?.bookings.completed || 0}
                      </div>
                      <div className="text-sm text-purple-800">Completed</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-600">
                        {((platformStats?.bookings.completed || 0) / (platformStats?.bookings.total || 1) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-800">Completion Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8"
        >
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Community Activity</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Activity className="w-4 h-4" />
                <span>Live updates</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {platformStats?.recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent community activity</p>
                  <p className="text-sm text-gray-500">Community posts will appear here</p>
                </div>
              ) : (
                platformStats?.recentActivity.map((activity, index) => (
                  <div key={activity._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(activity.category)}`}>
                          {activity.category}
                        </span>
                        {activity.mood && (
                          <span className="text-sm">{getMoodEmoji(activity.mood)} {activity.mood}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        by {activity.authorId.name}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDateTime(activity.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Mental Health Trends Chart */}
        {mentalHealthAnalytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mt-8"
          >
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Mental Health Trends</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Last {mentalHealthAnalytics.timeframe} days</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Screening Trends */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Screening Trends</h3>
                  <div className="space-y-2">
                    {mentalHealthAnalytics.screeningAnalytics.slice(0, 5).map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">
                          {trend._id.type} - {trend._id.severity}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {trend.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mood Trends */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Mood Trends</h3>
                  <div className="space-y-2">
                    {mentalHealthAnalytics.moodAnalytics.slice(0, 5).map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getMoodEmoji(trend._id.mood)}</span>
                          <span className="text-sm text-gray-700 capitalize">
                            {trend._id.mood}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {trend.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Concern Trends */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Concern Trends</h3>
                  <div className="space-y-2">
                    {mentalHealthAnalytics.concernAnalytics.slice(0, 5).map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(trend._id.category)}`}>
                          {trend._id.category}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {trend.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
