import { motion } from 'framer-motion'
import { Copy, Check, User, Shield, Heart } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const SampleLogins = () => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  const sampleLogins = [
    {
      role: 'Student',
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      credentials: {
        email: 'student@test.com',
        password: 'password123',
      },
      description: 'Access booking system, take screenings, view resources',
      features: ['Book appointments', 'Take mental health screenings', 'Access educational resources', 'Chat support'],
    },
    {
      role: 'Admin',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      credentials: {
        email: 'admin@test.com',
        password: 'admin123',
      },
      description: 'Full platform management, analytics, user management',
      features: ['View analytics dashboard', 'Manage users', 'Export data', 'System administration'],
    },
    {
      role: 'Dr. Sarah Johnson',
      icon: Heart,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      credentials: {
        email: 'sarah@counsellor.com',
        password: 'sarah123',
      },
      description: 'Manage bookings, view student profiles, track sessions',
      features: ['Manage bookings', 'View student profiles', 'Track sessions', 'Update availability'],
    },
    {
      role: 'Dr. Amaan Ahmed',
      icon: Heart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      credentials: {
        email: 'amaan@counsellor.com',
        password: 'amaan123',
      },
      description: 'Manage bookings, view student profiles, track sessions',
      features: ['Manage bookings', 'View student profiles', 'Track sessions', 'Update availability'],
    },
    {
      role: 'Dr. Monis Kumar',
      icon: Heart,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      credentials: {
        email: 'monis@counsellor.com',
        password: 'monis123',
      },
      description: 'Manage bookings, view student profiles, track sessions',
      features: ['Manage bookings', 'View student profiles', 'Track sessions', 'Update availability'],
    },
  ]

  const copyToClipboard = (text: string, item: string) => {
    navigator.clipboard.writeText(text)
    setCopiedItem(item)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedItem(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sample Login Credentials
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Use these pre-configured accounts to test different user roles and access levels in the platform.
          </p>
        </motion.div>

        {/* Sample Logins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {sampleLogins.map((login, index) => (
            <motion.div
              key={login.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`card border-2 ${login.borderColor} hover:shadow-lg transition-all duration-200`}
            >
              <div className="text-center mb-6">
                <div className={`w-16 h-16 ${login.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <login.icon className={`w-8 h-8 ${login.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{login.role}</h3>
                <p className="text-gray-600">{login.description}</p>
              </div>

              {/* Credentials */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={login.credentials.email}
                      readOnly
                      className="flex-1 input-field bg-gray-50"
                    />
                    <button
                      onClick={() => copyToClipboard(login.credentials.email, `${login.role}-email`)}
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {copiedItem === `${login.role}-email` ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="password"
                      value={login.credentials.password}
                      readOnly
                      className="flex-1 input-field bg-gray-50"
                    />
                    <button
                      onClick={() => copyToClipboard(login.credentials.password, `${login.role}-password`)}
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {copiedItem === `${login.role}-password` ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Available Features:</h4>
                <ul className="space-y-2">
                  {login.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Login Button */}
              <div className="mt-6">
                <button
                  onClick={() => {
                    copyToClipboard(`${login.credentials.email}\n${login.credentials.password}`, `${login.role}-all`)
                    // You could also auto-fill a login form here
                  }}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${login.bgColor} ${login.color} hover:opacity-80`}
                >
                  Copy Credentials
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use Sample Logins</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Step-by-Step Instructions:</h3>
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                  <span>Click "Copy Credentials" for the role you want to test</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                  <span>Go to the <a href="/login" className="text-primary-600 hover:underline">Login Page</a></span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                  <span>Paste the credentials into the login form</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">4</span>
                  <span>Explore the platform with the selected role's permissions</span>
                </li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Permissions:</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Student</div>
                    <div className="text-sm text-gray-600">Can book appointments, take screenings, access resources</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Admin</div>
                    <div className="text-sm text-gray-600">Full platform access, analytics, user management</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Heart className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Counsellors</div>
                    <div className="text-sm text-gray-600">Dr. Sarah, Dr. Amaan, Dr. Monis - Manage bookings, view student profiles, track sessions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 text-center"
        >
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-primary-900 mb-2">Ready to Test?</h3>
            <p className="text-primary-700 mb-4">
              Choose a role above and start exploring the platform with full functionality!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/login"
                className="btn-primary inline-flex items-center justify-center"
              >
                Go to Login Page
              </a>
              <a
                href="/"
                className="btn-outline inline-flex items-center justify-center"
              >
                Back to Home
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SampleLogins
