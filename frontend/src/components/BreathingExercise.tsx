import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Heart, 
  Wind, 
  Moon, 
  Sun,
  X,
  Volume2,
  VolumeX
} from 'lucide-react'

interface BreathingExerciseProps {
  onClose?: () => void
  isModal?: boolean
}

interface Exercise {
  id: string
  name: string
  description: string
  duration: number
  inhaleTime: number
  holdTime: number
  exhaleTime: number
  pauseTime: number
  color: string
  icon: any
  benefits: string[]
}

const exercises: Exercise[] = [
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    description: 'Inhale 4, Hold 4, Exhale 4, Hold 4 - Complete cycle',
    duration: 300, // 5 minutes
    inhaleTime: 4,
    holdTime: 4,
    exhaleTime: 4,
    pauseTime: 4,
    color: 'from-blue-500 to-blue-700',
    icon: Wind,
    benefits: ['Reduces stress', 'Improves focus', 'Calms nervous system']
  },
  {
    id: 'calm-breathing',
    name: 'Calm Breathing',
    description: 'Gentle 3-2-3-2 pattern for immediate relief',
    duration: 180, // 3 minutes
    inhaleTime: 3,
    holdTime: 2,
    exhaleTime: 3,
    pauseTime: 2,
    color: 'from-purple-500 to-purple-700',
    icon: Moon,
    benefits: ['Quick relief', 'Easy to follow', 'Suitable for beginners']
  },
  {
    id: 'deep-breathing',
    name: 'Deep Breathing',
    description: 'Deep 5-3-5-3 pattern for deep relaxation',
    duration: 240, // 4 minutes
    inhaleTime: 5,
    holdTime: 3,
    exhaleTime: 5,
    pauseTime: 3,
    color: 'from-green-500 to-green-700',
    icon: Heart,
    benefits: ['Deep relaxation', 'Reduces anxiety', 'Promotes sleep']
  },
  {
    id: 'quick-breathing',
    name: 'Quick Breathing',
    description: 'Fast 2-1-2-1 pattern for energy boost',
    duration: 120, // 2 minutes
    inhaleTime: 2,
    holdTime: 1,
    exhaleTime: 2,
    pauseTime: 1,
    color: 'from-orange-500 to-orange-700',
    icon: Sun,
    benefits: ['Quick energy', 'Fast relief', 'Easy to do anywhere']
  }
]

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ onClose, isModal = false }) => {
  const [isActive, setIsActive] = useState(false)
  const [currentExercise, setCurrentExercise] = useState<Exercise>(exercises[0])
  const [timeRemaining, setTimeRemaining] = useState(currentExercise.duration)
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale')
  const [phaseTime, setPhaseTime] = useState(currentExercise.inhaleTime)
  const [showSettings, setShowSettings] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [customDuration, setCustomDuration] = useState(currentExercise.duration)
  const [showCompletion, setShowCompletion] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const phaseIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const currentPhaseRef = useRef<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale')

  // Initialize audio context
  useEffect(() => {
    if (soundEnabled && typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }, [soundEnabled])

  // Play gentle tone for phase transitions
  const playTone = (frequency: number, duration: number) => {
    if (!soundEnabled || !audioContextRef.current) return

    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)
    
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime)
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration)
    
    oscillator.start(audioContextRef.current.currentTime)
    oscillator.stop(audioContextRef.current.currentTime + duration)
  }

  const startExercise = () => {
    setIsActive(true)
    setTimeRemaining(customDuration)
    setCurrentPhase('inhale')
    setPhaseTime(currentExercise.inhaleTime)
    currentPhaseRef.current = 'inhale'
    
    // Start main timer
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          completeExercise()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Start phase timer
    startPhaseTimer()
  }

  const startPhaseTimer = () => {
    phaseIntervalRef.current = setInterval(() => {
      setPhaseTime(prev => {
        if (prev <= 1) {
          // Move to next phase
          const nextPhase = getNextPhase(currentPhaseRef.current)
          const nextPhaseTime = getPhaseTime(nextPhase)
          
          // Update both phase and time
          currentPhaseRef.current = nextPhase
          setCurrentPhase(nextPhase)
          setPhaseTime(nextPhaseTime)
          
          // Play transition tone
          playTone(getPhaseFrequency(nextPhase), 0.2)
          
          return nextPhaseTime
        }
        return prev - 1
      })
    }, 1000)
  }

  const getNextPhase = (phase: string): 'inhale' | 'hold' | 'exhale' | 'pause' => {
    switch (phase) {
      case 'inhale': 
        return currentExercise.holdTime > 0 ? 'hold' : 'exhale'
      case 'hold': 
        return 'exhale'
      case 'exhale': 
        return currentExercise.pauseTime > 0 ? 'pause' : 'inhale'
      case 'pause': 
        return 'inhale'
      default: 
        return 'inhale'
    }
  }

  const getPhaseTime = (phase: string): number => {
    switch (phase) {
      case 'inhale': return currentExercise.inhaleTime
      case 'hold': return currentExercise.holdTime
      case 'exhale': return currentExercise.exhaleTime
      case 'pause': return currentExercise.pauseTime
      default: return 3
    }
  }

  const getPhaseFrequency = (phase: string): number => {
    switch (phase) {
      case 'inhale': return 440 // A4
      case 'hold': return 523 // C5
      case 'exhale': return 349 // F4
      case 'pause': return 262 // C4
      default: return 440
    }
  }

  const pauseExercise = () => {
    setIsActive(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (phaseIntervalRef.current) clearInterval(phaseIntervalRef.current)
  }

  const stopExercise = () => {
    setIsActive(false)
    setTimeRemaining(customDuration)
    setCurrentPhase('inhale')
    setPhaseTime(currentExercise.inhaleTime)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (phaseIntervalRef.current) clearInterval(phaseIntervalRef.current)
  }

  const completeExercise = () => {
    stopExercise()
    setShowCompletion(true)
    // Play completion tone
    if (soundEnabled && audioContextRef.current) {
      playTone(523, 0.5) // C5 note for completion
    }
    // Auto-hide completion message after 5 seconds
    setTimeout(() => setShowCompletion(false), 5000)
  }

  const resetExercise = () => {
    stopExercise()
    setTimeRemaining(customDuration)
    setCurrentPhase('inhale')
    setPhaseTime(currentExercise.inhaleTime)
    currentPhaseRef.current = 'inhale'
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPhaseText = (phase: string): string => {
    switch (phase) {
      case 'inhale': return 'Breathe In'
      case 'hold': return 'Hold'
      case 'exhale': return 'Breathe Out'
      case 'pause': return 'Rest'
      default: return 'Breathe'
    }
  }

  const getPhaseColor = (phase: string): string => {
    switch (phase) {
      case 'inhale': return 'text-blue-600'
      case 'hold': return 'text-green-600'
      case 'exhale': return 'text-purple-600'
      case 'pause': return 'text-gray-600'
      default: return 'text-blue-600'
    }
  }

  const getScaleValue = (): number => {
    if (!isActive) return 1
    switch (currentPhase) {
      case 'inhale': return 1.3
      case 'hold': return 1.3
      case 'exhale': return 0.7
      case 'pause': return 0.7
      default: return 1
    }
  }

  const getPhaseInstructions = (): string => {
    switch (currentPhase) {
      case 'inhale': return 'Breathe in slowly and deeply through your nose'
      case 'hold': return 'Hold your breath gently, don\'t strain'
      case 'exhale': return 'Breathe out slowly through your mouth'
      case 'pause': return 'Rest and prepare for the next breath'
      default: return 'Follow the breathing pattern'
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (phaseIntervalRef.current) clearInterval(phaseIntervalRef.current)
    }
  }, [])

  const content = (
    <div className={`${isModal ? 'bg-white rounded-xl shadow-2xl' : 'bg-white rounded-lg shadow-lg'} p-6 max-w-4xl mx-auto`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-r ${currentExercise.color} rounded-lg flex items-center justify-center`}>
            <currentExercise.icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Breathing Exercise</h2>
            <p className="text-sm text-gray-600">Find your calm and center</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              soundEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-gray-50 rounded-lg"
          >
            <h3 className="font-medium text-gray-900 mb-4">Exercise Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exercise Type
                </label>
                <select
                  value={currentExercise.id}
                  onChange={(e) => {
                    const exercise = exercises.find(ex => ex.id === e.target.value)
                    if (exercise) {
                      setCurrentExercise(exercise)
                      setCustomDuration(exercise.duration)
                      resetExercise()
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {exercises.map(exercise => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  min="60"
                  max="1800"
                  value={customDuration}
                  onChange={(e) => {
                    setCustomDuration(parseInt(e.target.value))
                    setTimeRemaining(parseInt(e.target.value))
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
              <div className="flex flex-wrap gap-2">
                {currentExercise.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Breathing Circle */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative mb-8">
            <motion.div
              animate={{
                scale: getScaleValue(),
                opacity: isActive ? 1 : 0.7
              }}
              transition={{
                duration: 1,
                ease: "easeInOut"
              }}
              className={`w-64 h-64 bg-gradient-to-r ${currentExercise.color} rounded-full flex items-center justify-center shadow-2xl`}
            >
              <div className="text-center text-white">
                <motion.div
                  animate={{
                    scale: isActive ? [1, 1.1, 1] : 1
                  }}
                  transition={{
                    duration: 2,
                    repeat: isActive ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                  className="text-6xl font-bold"
                >
                  {phaseTime}
                </motion.div>
                <div className={`text-lg font-medium ${getPhaseColor(currentPhase)}`}>
                  {getPhaseText(currentPhase)}
                </div>
                {isActive && (
                  <div className="text-sm text-white/80 mt-2 max-w-xs text-center">
                    {getPhaseInstructions()}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {!isActive ? (
              <button
                onClick={startExercise}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Play className="w-5 h-5" />
                <span>Start</span>
              </button>
            ) : (
              <button
                onClick={pauseExercise}
                className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
              >
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </button>
            )}
            
            <button
              onClick={resetExercise}
              className="flex items-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Completion Message */}
          <AnimatePresence>
            {showCompletion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg text-center"
              >
                <div className="text-green-800 font-medium mb-1">🎉 Exercise Complete!</div>
                <div className="text-green-700 text-sm">
                  Great job! You've completed your breathing exercise. Take a moment to notice how you feel.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Exercise Info */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {currentExercise.name}
            </h3>
            <p className="text-gray-600 mb-4">
              {currentExercise.description}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-900">Inhale</div>
                <div className="text-2xl font-bold text-blue-600">{currentExercise.inhaleTime}s</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-900">Hold</div>
                <div className="text-2xl font-bold text-green-600">{currentExercise.holdTime}s</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-900">Exhale</div>
                <div className="text-2xl font-bold text-purple-600">{currentExercise.exhaleTime}s</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-900">Rest</div>
                <div className="text-2xl font-bold text-gray-600">{currentExercise.pauseTime}s</div>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Time Remaining</span>
              <span className="text-sm text-gray-600">
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: "100%" }}
                animate={{ 
                  width: `${(timeRemaining / customDuration) * 100}%` 
                }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Find a comfortable seated position</li>
              <li>• Close your eyes or focus on a fixed point</li>
              <li>• Follow the breathing pattern shown</li>
              <li>• Breathe naturally and don't force it</li>
              <li>• Stop if you feel dizzy or uncomfortable</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          {content}
        </motion.div>
      </div>
    )
  }

  return content
}

export default BreathingExercise
