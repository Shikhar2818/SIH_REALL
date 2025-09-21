import React, { useState } from 'react'
import { Play, Calendar, Eye, Tag } from 'lucide-react'
import YouTubePlayer from './YouTubePlayer'

interface YouTubeVideoCardProps {
  video: {
    _id: string
    title: string
    description: string
    youtubeId: string
    youtubeUrl: string
    thumbnailUrl?: string
    duration?: string
    tags: string[]
    viewCount: number
    createdAt: string
    featured?: boolean
  }
  showPlayer?: boolean
}

const YouTubeVideoCard: React.FC<YouTubeVideoCardProps> = ({ 
  video, 
  showPlayer = false 
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handlePlay = () => {
    setIsPlaying(true)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setIsPlaying(false)
  }

  // Get YouTube thumbnail URL
  const getThumbnailUrl = (videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'maxres') => {
    return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
        {/* Video Thumbnail */}
        <div className="relative aspect-video bg-gray-200">
          <img
            src={video.thumbnailUrl || getThumbnailUrl(video.youtubeId, 'maxres')}
            alt={video.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to medium quality if maxres fails
              const target = e.target as HTMLImageElement;
              target.src = getThumbnailUrl(video.youtubeId, 'high');
            }}
          />
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <button
              onClick={handlePlay}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transition-all duration-200 transform hover:scale-110"
            >
              <Play className="w-8 h-8 ml-1" />
            </button>
          </div>

          {/* Featured Badge */}
          {video.featured && (
            <div className="absolute top-2 left-2">
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                Featured
              </span>
            </div>
          )}

          {/* Duration Badge */}
          {video.duration && (
            <div className="absolute bottom-2 right-2">
              <span className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                {video.duration}
              </span>
            </div>
          )}
        </div>

        {/* Video Information */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {video.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {video.description}
          </p>

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {video.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
              {video.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{video.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Video Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                <span>{video.viewCount} views</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{formatDate(video.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">{video.title}</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-4">
              {/* YouTube Embed */}
              <div className="mb-4">
                <iframe
                  src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                  title={video.title}
                />
              </div>
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{video.description}</p>
                
                {video.tags && video.tags.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {video.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default YouTubeVideoCard
