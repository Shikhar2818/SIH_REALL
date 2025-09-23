import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bot, Send, Trash2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import toast from 'react-hot-toast'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  isAI?: boolean
  type?: string
  responseTime?: number
}

interface AIStatus {
  isHealthy: boolean
  lastChecked: Date
  error?: string
}

const AIChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [aiStatus, setAiStatus] = useState<AIStatus>({ isHealthy: false, lastChecked: new Date() })
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const { } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    checkAIStatus()
    // Check AI status every 30 seconds
    const interval = setInterval(checkAIStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkAIStatus = async () => {
    try {
      const response = await api.get('/ai-chat/health')
      setAiStatus({
        isHealthy: response.data.status === 'healthy',
        lastChecked: new Date(),
        error: response.data.status === 'unhealthy' ? response.data.error : undefined
      })
    } catch (error) {
      setAiStatus({
        isHealthy: false,
        lastChecked: new Date(),
        error: 'AI service unavailable'
      })
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || isStreaming) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue('')
    setIsLoading(true)

    try {
      // Try streaming first
      await sendStreamingMessage(currentInput)
    } catch (error) {
      console.error('Streaming failed, trying regular chat:', error)
      // Fallback to regular chat
      try {
        const response = await api.post('/ai-chat', {
          message: currentInput
        })

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data.reply,
          isUser: false,
          isAI: response.data.isAI,
          type: response.data.type,
          responseTime: response.data.responseTime,
          timestamp: new Date(),
        }

        setMessages(prev => [...prev, botMessage])
      } catch (fallbackError) {
        console.error('Both streaming and regular chat failed:', fallbackError)
        toast.error('Failed to send message. AI service may be unavailable.')
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm experiencing some technical difficulties. Please try again later or contact support if the issue persists.",
          isUser: false,
          isAI: false,
          type: 'error',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const sendStreamingMessage = async (message: string) => {
    setIsStreaming(true)
    
    // Create abort controller for this request
    abortControllerRef.current = new AbortController()
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: '',
      isUser: false,
      isAI: true,
      type: 'streaming',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, botMessage])

    try {
      const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_URL}/api/ai-chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let fullResponse = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                fullResponse += data.content
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === botMessage.id 
                      ? { ...msg, text: fullResponse }
                      : msg
                  )
                )
              }
              if (data.done) {
                setIsStreaming(false)
                return
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError)
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Streaming aborted')
        return
      }
      throw error
    } finally {
      setIsStreaming(false)
    }
  }

  const clearConversation = async () => {
    try {
      await api.post('/ai-chat/clear')
      setMessages([])
      toast.success('Conversation cleared')
    } catch (error) {
      console.error('Clear conversation error:', error)
      toast.error('Failed to clear conversation')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusIcon = () => {
    if (aiStatus.isHealthy) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    return <AlertCircle className="w-4 h-4 text-red-500" />
  }

  const getStatusText = () => {
    if (aiStatus.isHealthy) {
      return language === 'hi' ? 'AI सहायक ऑनलाइन' : 'AI Assistant Online'
    }
    return language === 'hi' ? 'AI सहायक ऑफलाइन' : 'AI Assistant Offline'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AI Mental Health Assistant</h1>
                  <p className="text-gray-600">Get instant support and guidance for your mental health journey</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Language Toggle */}
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      language === 'en' 
                        ? 'bg-white text-primary-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('hi')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      language === 'hi' 
                        ? 'bg-white text-primary-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    हिंदी
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon()}
                  <span className={`text-sm font-medium ${aiStatus.isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                    {getStatusText()}
                  </span>
                </div>
                <button
                  onClick={checkAIStatus}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Refresh AI Status"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[600px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === 'hi' ? 'AI सहायक में आपका स्वागत है' : 'Welcome to AI Assistant'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {language === 'hi' 
                    ? 'मैं यहाँ मानसिक स्वास्थ्य सहायता, प्रश्नों के उत्तर और आपकी कल्याण यात्रा में मार्गदर्शन प्रदान करने के लिए हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?'
                    : "I'm here to provide mental health support, answer questions, and guide you through your wellness journey. How can I help you today?"
                  }
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
                  <div className="bg-gray-50 rounded-lg p-3 text-left">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {language === 'hi' ? '💡 त्वरित सहायता' : '💡 Quick Help'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {language === 'hi' 
                        ? 'तनाव प्रबंधन, चिंता या अवसाद के बारे में पूछें'
                        : 'Ask about stress management, anxiety, or depression'
                      }
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-left">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {language === 'hi' ? '📚 संसाधन' : '📚 Resources'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {language === 'hi' 
                        ? 'मानसिक स्वास्थ्य संसाधनों के बारे में जानकारी प्राप्त करें'
                        : 'Get information about mental health resources'
                      }
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-left">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {language === 'hi' ? '🤝 सहायता' : '🤝 Support'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {language === 'hi' 
                        ? 'काउंसलिंग और सहकर्मी सहायता विकल्पों के बारे में जानें'
                        : 'Learn about counseling and peer support options'
                      }
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-left">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {language === 'hi' ? '🔍 जांच' : '🔍 Screening'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {language === 'hi' 
                        ? 'मानसिक स्वास्थ्य जांच उपकरणों को समझें'
                        : 'Understand mental health screening tools'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-2xl ${message.isUser ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      message.isUser
                        ? 'bg-primary-600 text-white'
                        : message.type === 'error'
                        ? 'bg-red-50 text-red-900 border border-red-200'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.text}</div>
                    {message.responseTime && (
                      <div className="text-xs opacity-70 mt-1">
                        Response time: {message.responseTime}ms
                      </div>
                    )}
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
                    {formatTimestamp(message.timestamp)}
                    {message.isAI && (
                      <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-600 rounded-full text-xs">
                        AI
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {(isLoading || isStreaming) && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm">
                      {isStreaming 
                        ? (language === 'hi' ? 'AI सोच रहा है...' : 'AI is thinking...')
                        : (language === 'hi' ? 'संदेश भेजा जा रहा है...' : 'Sending message...')
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-3">
              <div className="flex-1">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={language === 'hi' ? "अपना संदेश यहाँ लिखें... (भेजने के लिए Enter दबाएं, नई लाइन के लिए Shift+Enter)" : "Type your message here... (Press Enter to send, Shift+Enter for new line)"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={2}
                  disabled={isLoading || isStreaming}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading || isStreaming}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{language === 'hi' ? 'भेजें' : 'Send'}</span>
                </button>
                {messages.length > 0 && (
                  <button
                    onClick={clearConversation}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-3 rounded-lg transition-colors flex items-center space-x-2"
                    title="Clear conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{language === 'hi' ? 'साफ़ करें' : 'Clear'}</span>
                  </button>
                )}
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {aiStatus.isHealthy ? (
                <span className="text-green-600">
                  ✓ {language === 'hi' 
                    ? 'AI सहायक ऑनलाइन है और मदद के लिए तैयार है' 
                    : 'AI Assistant is online and ready to help'
                  }
                </span>
              ) : (
                <span className="text-red-600">
                  ⚠ {language === 'hi' 
                    ? 'AI सहायक ऑफलाइन है - प्रतिक्रियाएं सीमित हो सकती हैं' 
                    : 'AI Assistant is offline - responses may be limited'
                  }
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIChatbot
