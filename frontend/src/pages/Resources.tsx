import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Play, 
  FileText, 
  Headphones, 
  Search, 
  Filter,
  Download,
  ExternalLink
} from 'lucide-react'

interface Resource {
  _id: string
  title: string
  type: 'video' | 'audio' | 'pdf'
  language: string
  fileRef: string
  tags: string[]
  offlineAvailable: boolean
  description?: string
  createdAt: string
}

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchResources()
  }, [])

  useEffect(() => {
    filterResources()
  }, [resources, searchTerm, selectedType, selectedLanguage])

  const fetchResources = async () => {
    try {
      // Mock data for now - in real app, this would be an API call
      const mockResources: Resource[] = [
        {
          _id: '1',
          title: 'Understanding Anxiety',
          type: 'video',
          language: 'English',
          fileRef: '/videos/anxiety.mp4',
          tags: ['anxiety', 'mental-health', 'education'],
          offlineAvailable: true,
          description: 'A comprehensive guide to understanding anxiety and its symptoms.',
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          title: 'Meditation for Stress Relief',
          type: 'audio',
          language: 'English',
          fileRef: '/audio/meditation.mp3',
          tags: ['meditation', 'stress', 'relaxation'],
          offlineAvailable: true,
          description: 'Guided meditation session to help reduce stress and anxiety.',
          createdAt: new Date().toISOString(),
        },
        {
          _id: '3',
          title: 'Depression Self-Help Guide',
          type: 'pdf',
          language: 'English',
          fileRef: '/pdfs/depression-guide.pdf',
          tags: ['depression', 'self-help', 'guide'],
          offlineAvailable: false,
          description: 'A detailed guide for managing depression symptoms.',
          createdAt: new Date().toISOString(),
        },
        {
          _id: '4',
          title: 'Building Resilience',
          type: 'video',
          language: 'Hindi',
          fileRef: '/videos/resilience-hindi.mp4',
          tags: ['resilience', 'mental-health', 'hindi'],
          offlineAvailable: true,
          description: 'Learn how to build mental resilience and cope with challenges.',
          createdAt: new Date().toISOString(),
        },
      ]
      
      setResources(mockResources)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to fetch resources:', error)
      setIsLoading(false)
    }
  }

  const filterResources = () => {
    let filtered = resources

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType)
    }

    // Language filter
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(resource => resource.language === selectedLanguage)
    }

    setFilteredResources(filtered)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Play
      case 'audio':
        return Headphones
      case 'pdf':
        return FileText
      default:
        return BookOpen
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'text-red-600 bg-red-100'
      case 'audio':
        return 'text-purple-600 bg-purple-100'
      case 'pdf':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const handleResourceClick = (resource: Resource) => {
    // In a real app, this would open the resource
    console.log('Opening resource:', resource.title)
  }

  const uniqueLanguages = Array.from(new Set(resources.map(r => r.language)))
  const uniqueTypes = Array.from(new Set(resources.map(r => r.type)))

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mental Health Resources</h1>
          <p className="text-gray-600">
            Access educational materials, videos, and tools to support your mental health journey
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input-field"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            {/* Language Filter */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="input-field"
            >
              <option value="all">All Languages</option>
              {uniqueLanguages.map(language => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>

            {/* Results Count */}
            <div className="flex items-center text-sm text-gray-600">
              <span>{filteredResources.length} resources found</span>
            </div>
          </div>
        </motion.div>

        {/* Resources Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredResources.map((resource, index) => {
            const IconComponent = getTypeIcon(resource.type)
            const colorClass = getTypeColor(resource.type)

            return (
              <motion.div
                key={resource._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-hover cursor-pointer"
                onClick={() => handleResourceClick(resource)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${colorClass.split(' ')[1]} rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 ${colorClass.split(' ')[0]}`} />
                  </div>
                  <div className="flex items-center space-x-2">
                    {resource.offlineAvailable && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Offline
                      </span>
                    )}
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {resource.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {resource.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {resource.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{resource.tags.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{resource.language}</span>
                  <span>{resource.type.toUpperCase()}</span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {filteredResources.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters
            </p>
          </motion.div>
        )}

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12"
        >
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Resource Categories</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Videos</h3>
                <p className="text-gray-600 text-sm">
                  Educational videos on mental health topics
                </p>
              </div>

              <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Audio</h3>
                <p className="text-gray-600 text-sm">
                  Guided meditations and relaxation audio
                </p>
              </div>

              <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Documents</h3>
                <p className="text-gray-600 text-sm">
                  PDF guides and self-help materials
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Resources
