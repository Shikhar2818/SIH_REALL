import { motion } from 'framer-motion'
import BreathingExercise from '../components/BreathingExercise'

const BreathingExercisePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Breathing Exercises
          </h1>
          <p className="text-gray-600">
            Practice mindful breathing to reduce stress, anxiety, and find your inner calm
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <BreathingExercise />
        </motion.div>
      </div>
    </div>
  )
}

export default BreathingExercisePage

