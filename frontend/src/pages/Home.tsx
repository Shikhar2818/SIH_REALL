import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { 
  Heart, 
  Users, 
  BookOpen, 
  MessageCircle, 
  Shield, 
  Clock,
  CheckCircle,
  ArrowRight,
  Check,
  X,
  Star
} from 'lucide-react'

const Home = () => {
  const { t } = useLanguage()
  const { user } = useAuth()

  const features = [
    {
      icon: Users,
      title: t('features.counselling.title'),
      description: t('features.counselling.desc'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Heart,
      title: t('features.screening.title'),
      description: t('features.screening.desc'),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: BookOpen,
      title: t('features.resources.title'),
      description: t('features.resources.desc'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: MessageCircle,
      title: t('features.chat.title'),
      description: t('features.chat.desc'),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  const benefits = [
    'Professional counselling services',
    'Confidential and secure platform',
    '24/7 AI assistant support',
    'Mental health screening tools',
    'Educational resources and materials',
    'Stigma-free environment',
  ]

  const comparisonData = [
    {
      feature: 'Self-trained AI Chatbot',
      rapy: true,
      betterhelp: false,
      talkspace: false,
      sevencups: false,
      headspace: false,
      calm: false,
    },
    {
      feature: 'Regional Multi-lingual Resources',
      rapy: true,
      betterhelp: false,
      talkspace: false,
      sevencups: false,
      headspace: false,
      calm: false,
    },
    {
      feature: 'Counselor Appointment',
      rapy: true,
      betterhelp: true,
      talkspace: true,
      sevencups: true,
      headspace: false,
      calm: false,
    },
    {
      feature: 'Peer-to-Peer Community',
      rapy: true,
      betterhelp: false,
      talkspace: false,
      sevencups: true,
      headspace: false,
      calm: false,
    },
    {
      feature: 'Soothing Breathing Exercises',
      rapy: true,
      betterhelp: false,
      talkspace: false,
      sevencups: false,
      headspace: true,
      calm: true,
    },
    {
      feature: 'Personalized Progress Tracking',
      rapy: true,
      betterhelp: true,
      talkspace: true,
      sevencups: false,
      headspace: true,
      calm: true,
    },
    {
      feature: 'Anonymity & Privacy Focus',
      rapy: true,
      betterhelp: true,
      talkspace: true,
      sevencups: true,
      headspace: true,
      calm: true,
    },
    {
      feature: '24/7 Emergency Support',
      rapy: true,
      betterhelp: true,
      talkspace: true,
      sevencups: true,
      headspace: false,
      calm: false,
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              {t('hero.title')}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {user ? (
                <Link
                  to="/dashboard"
                  className="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center"
                  >
                    {t('hero.cta')}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="btn-outline text-lg px-8 py-3 inline-flex items-center justify-center"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Mental Health Support
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for your mental health journey in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-hover text-center"
              >
                <div className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Our Platform?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                We provide a safe, confidential, and accessible environment for students to access mental health support.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Secure & Confidential</h3>
                    <p className="text-gray-600">Your privacy is our priority</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">24/7 Available</h3>
                    <p className="text-gray-600">Support whenever you need it</p>
                  </div>
                </div>

                <div className="bg-primary-50 rounded-lg p-4">
                  <p className="text-primary-800 font-medium">
                    "This platform has been a lifeline for me. The counsellors are professional and understanding."
                  </p>
                  <p className="text-primary-600 text-sm mt-2">- Anonymous Student</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How We Compare to Other Platforms
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See why RAPY stands out with unique features that other mental health platforms don't offer
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-primary-600 to-blue-600 text-white">
                    <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-sm uppercase tracking-wider relative">
                      <div className="flex items-center justify-center space-x-2">
                        <Star className="w-4 h-4" />
                        <span>RAPY</span>
                      </div>
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                        BEST
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-sm uppercase tracking-wider">
                      BetterHelp
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-sm uppercase tracking-wider">
                      Talkspace
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-sm uppercase tracking-wider">
                      7 Cups
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-sm uppercase tracking-wider">
                      Headspace
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-sm uppercase tracking-wider">
                      Calm
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {comparisonData.map((row, index) => (
                    <motion.tr
                      key={row.feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.feature}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          {row.rapy ? (
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-green-600" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                              <X className="w-4 h-4 text-red-600" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          {row.betterhelp ? (
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-green-600" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                              <X className="w-4 h-4 text-red-600" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          {row.talkspace ? (
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-green-600" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                              <X className="w-4 h-4 text-red-600" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          {row.sevencups ? (
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-green-600" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                              <X className="w-4 h-4 text-red-600" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          {row.headspace ? (
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-green-600" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                              <X className="w-4 h-4 text-red-600" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          {row.calm ? (
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-green-600" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                              <X className="w-4 h-4 text-red-600" />
                            </div>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Summary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">8/8</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">Features</div>
              <div className="text-gray-600">RAPY offers all features</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">2</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">Unique Features</div>
              <div className="text-gray-600">AI Chatbot & Multi-lingual</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">Complete</div>
              <div className="text-gray-600">All essential features included</div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}

export default Home
