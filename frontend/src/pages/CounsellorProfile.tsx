import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  Globe, 
  Save,
  Edit,
  X,
  Check
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface CounsellorProfile {
  name: string
  email: string
  languages: string[]
  availabilitySlots: {
    dayOfWeek: number
    startTime: string
    endTime: string
  }[]
  verified: boolean
  bio?: string
  specialization?: string[]
  experience?: number
}

const CounsellorProfile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<CounsellorProfile>({
    name: user?.name || '',
    email: user?.email || '',
    languages: ['English'],
    availabilitySlots: [],
    verified: false,
    bio: '',
    specialization: [],
    experience: 0
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return

      // Fetch counsellor profile data
      const response = await fetch('http://localhost:3001/api/counsellor/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const profileData = await response.json()
        setProfile(profileData)
      } else {
        // If no profile exists, create a default one
        setProfile({
          name: user?.name || '',
          email: user?.email || '',
          languages: ['English'],
          availabilitySlots: [],
          verified: false,
          bio: '',
          specialization: [],
          experience: 0
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return

      const response = await fetch('http://localhost:3001/api/counsellor/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      })

      if (response.ok) {
        setIsEditing(false)
        // Show success message
      } else {
        console.error('Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const addAvailabilitySlot = () => {
    setProfile(prev => ({
      ...prev,
      availabilitySlots: [...prev.availabilitySlots, { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }]
    }))
  }

  const removeAvailabilitySlot = (index: number) => {
    setProfile(prev => ({
      ...prev,
      availabilitySlots: prev.availabilitySlots.filter((_, i) => i !== index)
    }))
  }

  const updateAvailabilitySlot = (index: number, field: string, value: string | number) => {
    setProfile(prev => ({
      ...prev,
      availabilitySlots: prev.availabilitySlots.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }))
  }

  const addLanguage = (language: string) => {
    if (language && !profile.languages.includes(language)) {
      setProfile(prev => ({
        ...prev,
        languages: [...prev.languages, language]
      }))
    }
  }

  const removeLanguage = (language: string) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }))
  }

  const addSpecialization = (specialization: string) => {
    if (specialization && !profile.specialization?.includes(specialization)) {
      setProfile(prev => ({
        ...prev,
        specialization: [...(prev.specialization || []), specialization]
      }))
    }
  }

  const removeSpecialization = (specialization: string) => {
    setProfile(prev => ({
      ...prev,
      specialization: prev.specialization?.filter(s => s !== specialization) || []
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="mt-2 text-gray-600">
                Manage your counsellor profile and availability
              </p>
            </div>
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={profile.experience}
                    onChange={(e) => setProfile(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={profile.verified}
                    disabled
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Verified Counsellor
                  </label>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bio</h3>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                disabled={!isEditing}
                rows={4}
                placeholder="Tell students about your background and approach to counselling..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
              />
            </div>

            {/* Languages */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Languages</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.languages.map((language) => (
                  <span
                    key={language}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {language}
                    {isEditing && (
                      <button
                        onClick={() => removeLanguage(language)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditing && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add language"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addLanguage(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}
            </div>

            {/* Specialization */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Specialization</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.specialization?.map((spec) => (
                  <span
                    key={spec}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                  >
                    {spec}
                    {isEditing && (
                      <button
                        onClick={() => removeSpecialization(spec)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditing && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add specialization"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSpecialization(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Availability */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Availability</h3>
                {isEditing && (
                  <button
                    onClick={addAvailabilitySlot}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    + Add Slot
                  </button>
                )}
              </div>
              
              {profile.availabilitySlots.length > 0 ? (
                <div className="space-y-3">
                  {profile.availabilitySlots.map((slot, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {dayNames[slot.dayOfWeek]}
                        </span>
                        {isEditing && (
                          <button
                            onClick={() => removeAvailabilitySlot(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {isEditing ? (
                          <>
                            <select
                              value={slot.dayOfWeek}
                              onChange={(e) => updateAvailabilitySlot(index, 'dayOfWeek', parseInt(e.target.value))}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                            >
                              {dayNames.map((day, dayIndex) => (
                                <option key={dayIndex} value={dayIndex}>{day}</option>
                              ))}
                            </select>
                            <div className="flex space-x-1">
                              <input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => updateAvailabilitySlot(index, 'startTime', e.target.value)}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                              />
                              <span className="flex items-center text-gray-500">to</span>
                              <input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => updateAvailabilitySlot(index, 'endTime', e.target.value)}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                              />
                            </div>
                          </>
                        ) : (
                          <span className="text-sm text-gray-600">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No availability set</p>
                  {isEditing && (
                    <button
                      onClick={addAvailabilitySlot}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Add your first availability slot
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Profile Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profile Completeness</span>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round((profile.name && profile.bio && profile.availabilitySlots.length > 0 ? 100 : 60))}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((profile.name && profile.bio && profile.availabilitySlots.length > 0 ? 100 : 60))}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Complete your profile to get more bookings
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default CounsellorProfile
