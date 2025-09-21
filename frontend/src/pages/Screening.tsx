import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react'
import { api } from '../utils/api'
import { formatDate } from '../utils/date'
import toast from 'react-hot-toast'

interface Question {
  id: string
  text: string
}

interface ScreeningData {
  type: 'PHQ9' | 'GAD7'
  title: string
  description: string
  questions: Question[]
  options: { value: number; label: string }[]
}

interface ScreeningResult {
  _id: string
  type: string
  totalScore: number
  severity: string
  createdAt: string
}

const Screening = () => {
  const [screenings, setScreenings] = useState<ScreeningData[]>([])
  const [selectedScreening, setSelectedScreening] = useState<ScreeningData | null>(null)
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<ScreeningResult[]>([])
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    fetchScreenings()
    fetchResults()
  }, [])

  const fetchScreenings = async () => {
    try {
      const [phq9Response, gad7Response, pss10Response, dass21Response] = await Promise.all([
        api.get('/screenings/questions/PHQ9'),
        api.get('/screenings/questions/GAD7'),
        api.get('/screenings/questions/PSS10'),
        api.get('/screenings/questions/DASS21'),
      ])
      
      setScreenings([phq9Response.data, gad7Response.data, pss10Response.data, dass21Response.data])
    } catch (error) {
      toast.error('Failed to fetch screening questions')
    }
  }

  const fetchResults = async () => {
    try {
      const response = await api.get('/screenings/history')
      setResults(response.data.screenings)
    } catch (error) {
      toast.error('Failed to fetch screening results')
    }
  }

  const handleScreeningSelect = (screening: ScreeningData) => {
    setSelectedScreening(screening)
    setResponses({})
    setShowResults(false)
  }

  const handleResponseChange = (questionId: string, value: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleSubmit = async () => {
    if (!selectedScreening) return

    const allQuestionsAnswered = selectedScreening.questions.every(
      question => responses[question.id] !== undefined
    )

    if (!allQuestionsAnswered) {
      toast.error('Please answer all questions')
      return
    }

    setIsSubmitting(true)
    try {
      const responseData = selectedScreening.questions.map(question => ({
        questionId: question.id,
        score: responses[question.id]
      }))

      await api.post('/screenings', {
        type: selectedScreening.type,
        responses: responseData
      })

      toast.success('Screening completed successfully!')
      setShowResults(true)
      fetchResults()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit screening')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minimal':
        return 'text-green-600 bg-green-100'
      case 'mild':
        return 'text-yellow-600 bg-yellow-100'
      case 'moderate':
        return 'text-orange-600 bg-orange-100'
      case 'moderately_severe':
        return 'text-red-600 bg-red-100'
      case 'severe':
        return 'text-red-800 bg-red-200'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityMessage = (severity: string) => {
    switch (severity) {
      case 'minimal':
        return 'Your symptoms are minimal. Continue with self-care practices.'
      case 'mild':
        return 'You may be experiencing mild symptoms. Consider speaking with a counsellor.'
      case 'moderate':
        return 'You are experiencing moderate symptoms. We recommend booking an appointment with a counsellor.'
      case 'moderately_severe':
        return 'You are experiencing moderately severe symptoms. Please book an appointment with a counsellor soon.'
      case 'severe':
        return 'You are experiencing severe symptoms. Please book an appointment with a counsellor immediately or contact emergency services if needed.'
      default:
        return 'Please consult with a mental health professional.'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mental Health Screening</h1>
          <p className="text-gray-600">
            Take a quick assessment to understand your mental health status
          </p>
        </motion.div>

        {!selectedScreening ? (
          /* Screening Selection */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            {screenings.map((screening) => (
              <div key={screening.type} className="card-hover">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Heart className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{screening.title}</h3>
                    <p className="text-sm text-gray-600">{screening.questions.length} questions</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{screening.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>5-10 minutes</span>
                  </div>
                  <button
                    onClick={() => handleScreeningSelect(screening)}
                    className="btn-primary"
                  >
                    Start Assessment
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          /* Screening Questions */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">{selectedScreening.title}</h2>
              <p className="text-gray-600">{selectedScreening.description}</p>
            </div>

            <div className="space-y-6">
              {selectedScreening.questions.map((question, index) => (
                <div key={question.id} className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {index + 1}. {question.text}
                  </h3>
                  
                  <div className="space-y-2">
                    {selectedScreening.options.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option.value}
                          checked={responses[question.id] === option.value}
                          onChange={() => handleResponseChange(question.id, option.value)}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-gray-900">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedScreening(null)}
                className="btn-secondary"
              >
                Back to Assessments
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Submit Assessment'
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Results History */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8"
          >
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Previous Results</h2>
              
              <div className="space-y-4">
                {results.map((result) => (
                  <div key={result._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{result.type}</h3>
                          <p className="text-sm text-gray-600">{formatDate(result.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{result.totalScore}</div>
                        <div className="text-sm text-gray-600">Total Score</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(result.severity)}`}
                      >
                        {result.severity.replace('_', ' ')}
                      </span>
                      <p className="text-sm text-gray-600">
                        {getSeverityMessage(result.severity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Important Information</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  These assessments are screening tools and not a substitute for professional diagnosis. 
                  If you're experiencing severe symptoms or having thoughts of self-harm, please contact 
                  emergency services immediately or speak with a mental health professional.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Screening
