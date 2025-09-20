import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Calendar, 
  Heart, 
  BookOpen, 
  MessageCircle, 
  Clock,
  TrendingUp,
  Users,
  CheckCircle
} from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()

  const quickActions = [
    {
      title: 'Book Appointment',
      description: 'Schedule a session with a counsellor',
      icon: Calendar,
      href: '/bookings',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Take Screening',
      description: 'Complete a mental health assessment',
      icon: Heart,
      href: '/screening',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Browse Resources',
      description: 'Access educational materials',
      icon: BookOpen,
      href: '/resources',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Chat Support',
      description: 'Get instant help from our AI assistant',
      icon: MessageCircle,
      href: '#',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  const stats = [
    { label: 'Upcoming Appointments', value: '2', icon: Calendar },
    { label: 'Screenings Completed', value: '1', icon: Heart },
    { label: 'Resources Accessed', value: '5', icon: BookOpen },
    { label: 'Chat Sessions', value: '3', icon: MessageCircle },
  ]

  const recentActivities = [
    {
      id: 1,
      title: 'Completed PHQ-9 Screening',
      description: 'Your screening results show mild symptoms',
      time: '2 hours ago',
      type: 'screening',
    },
    {
      id: 2,
      title: 'Appointment Booked',
      description: 'Session with Dr. Monis scheduled for tomorrow',
      time: '1 day ago',
      type: 'booking',
    },
    {
      id: 3,
      title: 'Resource Accessed',
      description: 'Viewed "Managing Stress" video',
      time: '3 days ago',
      type: 'resource',
    },
  ]

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
          {stats.map((stat, index) => (
            <div key={stat.label} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>
          ))}
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
                {quickActions.map((action, index) => (
                  <Link
                    key={action.title}
                    to={action.href}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 ${action.bgColor} rounded-lg flex items-center justify-center`}>
                        <action.icon className={`w-5 h-5 ${action.color}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Upcoming Appointments */}
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
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Session with Dr. Monis</p>
                    <p className="text-sm text-gray-600">Tomorrow at 2:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <Clock className="w-4 h-4" />
                  <span>1 hour</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Session with Dr. Amaan</p>
                    <p className="text-sm text-gray-600">Friday at 10:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <Clock className="w-4 h-4" />
                  <span>3 days</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

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

export default Dashboard
