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
  ExternalLink,
  Youtube,
  Volume2
} from 'lucide-react'
import YouTubeVideoCard from '../components/YouTubeVideoCard'
import YouTubeAudioCard from '../components/YouTubeAudioCard'
import api from '../utils/api'
import toast from 'react-hot-toast'

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

interface YouTubeVideo {
  _id: string
  title: string
  description: string
  youtubeId: string
  youtubeUrl: string
  thumbnailUrl?: string
  duration?: string
  tags: string[]
  viewCount: number
  featured?: boolean
  createdAt: string
}

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([])
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([])
  const [youtubeAudios, setYoutubeAudios] = useState<YouTubeVideo[]>([])
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

  useEffect(() => {
    // YouTube videos and audios filtering is handled in the render function
  }, [youtubeVideos, youtubeAudios, searchTerm, selectedLanguage])

  const fetchResources = async () => {
    try {
      // Fetch YouTube videos
      const videosResponse = await api.get('/resources?category=video')
      console.log('YouTube videos response:', videosResponse.data)
      setYoutubeVideos(videosResponse.data.resources || [])

      // Fetch YouTube audios (same endpoint, but we'll filter by tags)
      const audiosResponse = await api.get('/resources?category=audio')
      console.log('YouTube audios response:', audiosResponse.data)
      setYoutubeAudios(audiosResponse.data.resources || [])

      // Mock data for other resources - in real app, this would be an API call
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
      toast.error('Failed to load resources')
      // Set empty arrays on error
      setYoutubeVideos([])
      setResources([])
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

    // Language filter - only apply if we have regular resources with language field
    if (selectedLanguage !== 'all' && resources.length > 0) {
      filtered = filtered.filter(resource => resource.language === selectedLanguage)
    }

    setFilteredResources(filtered)
  }

  const filterYouTubeVideos = () => {
    let filtered = youtubeVideos

    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(video => 
        selectedLanguage === 'english' ? video.tags.includes('english') :
        selectedLanguage === 'hindi' ? video.tags.includes('hindi') :
        true
      )
    }

    return filtered
  }

  const filterYouTubeAudios = () => {
    let filtered = youtubeAudios

    if (searchTerm) {
      filtered = filtered.filter(audio =>
        audio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audio.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audio.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(audio => 
        selectedLanguage === 'english' ? audio.tags.includes('english') :
        selectedLanguage === 'hindi' ? audio.tags.includes('hindi') :
        true
      )
    }

    return filtered
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

  const uniqueTypes = Array.from(new Set(resources.map(r => r.type)))
  
  // Only include functional video language options
  const allLanguageOptions = [
    ...(youtubeVideos.some(v => v.tags.includes('english')) ? ['english'] : []),
    ...(youtubeVideos.some(v => v.tags.includes('hindi')) ? ['hindi'] : [])
  ].filter((value, index, self) => self.indexOf(value) === index)

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
          <div className={`grid grid-cols-1 gap-4 ${youtubeVideos.length > 0 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
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

            {/* Language Filter - only show if we have videos */}
            {youtubeVideos.length > 0 && (
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="input-field"
              >
                <option value="all">All Languages</option>
                {allLanguageOptions.map(language => (
                  <option key={language} value={language}>
                    {language.charAt(0).toUpperCase() + language.slice(1)}
                  </option>
                ))}
              </select>
            )}

             {/* Results Count */}
             <div className="flex items-center text-sm text-gray-600">
               {filteredResources.length > 0 && (
                 <span>{filteredResources.length} resources found</span>
               )}
               {(youtubeVideos.length > 0 || youtubeAudios.length > 0) && filteredResources.length > 0 && (
                 <span className="ml-2">•</span>
               )}
               {youtubeVideos.length > 0 && (
                 <span className={filteredResources.length > 0 ? "ml-2" : ""}>
                   {filterYouTubeVideos().length} videos
                 </span>
               )}
               {youtubeAudios.length > 0 && (
                 <span className={filteredResources.length > 0 || youtubeVideos.length > 0 ? "ml-2" : ""}>
                   {filterYouTubeAudios().length} audios
                 </span>
               )}
               {filteredResources.length === 0 && youtubeVideos.length === 0 && youtubeAudios.length === 0 && (
                 <span>No content found</span>
               )}
             </div>
          </div>
        </motion.div>

        {/* YouTube Videos Section */}
        {youtubeVideos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center mb-6">
              <Youtube className="w-6 h-6 text-red-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Educational Videos</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterYouTubeVideos().map((video, index) => (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <YouTubeVideoCard video={video} />
                </motion.div>
              ))}
            </div>
            
            {filterYouTubeVideos().length === 0 && youtubeVideos.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No videos found for the selected language filter.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* YouTube Audio Section */}
        {youtubeAudios.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-center mb-6">
              <Volume2 className="w-6 h-6 text-purple-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Audio Resources</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterYouTubeAudios().map((audio, index) => (
                <motion.div
                  key={audio._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <YouTubeAudioCard audio={audio} />
                </motion.div>
              ))}
            </div>
            
            {filterYouTubeAudios().length === 0 && youtubeAudios.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No audio found for the selected filters.</p>
              </div>
            )}
          </motion.div>
        )}

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

      </div>
    </div>
  )
}

export default Resources
