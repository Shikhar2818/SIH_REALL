import React, { useState, useEffect } from 'react'
import { Plus, Youtube, Trash2, Edit, Eye } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../utils/api'
import YouTubeVideoCard from '../components/YouTubeVideoCard'

interface VideoResource {
  _id: string
  title: string
  description: string
  content: string
  category: string
  tags: string[]
  youtubeId: string
  youtubeUrl: string
  thumbnailUrl?: string
  duration?: string
  viewCount: number
  isPublished: boolean
  featured: boolean
  createdAt: string
  authorId: {
    _id: string
    name: string
  }
}

const AdminVideoManager = () => {
  const [videos, setVideos] = useState<VideoResource[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState<VideoResource | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    youtubeUrl: '',
    tags: '',
    isPublished: false,
    featured: false
  })

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const response = await api.get('/resources?category=video')
      setVideos(response.data.resources || [])
    } catch (error) {
      console.error('Failed to fetch videos:', error)
      toast.error('Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const youtubeId = extractYouTubeId(formData.youtubeUrl)
      if (!youtubeId) {
        toast.error('Invalid YouTube URL')
        return
      }

      const videoData = {
        ...formData,
        category: 'video',
        youtubeId,
        youtubeUrl: formData.youtubeUrl,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
      }

      if (editingVideo) {
        await api.patch(`/resources/${editingVideo._id}`, videoData)
        toast.success('Video updated successfully!')
      } else {
        await api.post('/resources', videoData)
        toast.success('Video added successfully!')
      }

      setShowAddForm(false)
      setEditingVideo(null)
      setFormData({
        title: '',
        description: '',
        content: '',
        youtubeUrl: '',
        tags: '',
        isPublished: false,
        featured: false
      })
      fetchVideos()
    } catch (error: any) {
      console.error('Failed to save video:', error)
      toast.error(error.response?.data?.error || 'Failed to save video')
    }
  }

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      await api.delete(`/resources/${videoId}`)
      toast.success('Video deleted successfully!')
      fetchVideos()
    } catch (error: any) {
      console.error('Failed to delete video:', error)
      toast.error(error.response?.data?.error || 'Failed to delete video')
    }
  }

  const handleEdit = (video: VideoResource) => {
    setEditingVideo(video)
    setFormData({
      title: video.title,
      description: video.description,
      content: video.content,
      youtubeUrl: video.youtubeUrl,
      tags: video.tags.join(', '),
      isPublished: video.isPublished,
      featured: video.featured
    })
    setShowAddForm(true)
  }

  const togglePublishStatus = async (video: VideoResource) => {
    try {
      await api.patch(`/resources/${video._id}`, {
        isPublished: !video.isPublished
      })
      toast.success(`Video ${!video.isPublished ? 'published' : 'unpublished'}!`)
      fetchVideos()
    } catch (error: any) {
      console.error('Failed to update video status:', error)
      toast.error('Failed to update video status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Youtube className="w-8 h-8 mr-3 text-red-600" />
                Video Manager
              </h1>
              <p className="mt-2 text-gray-600">
                Manage YouTube video resources for students
              </p>
            </div>
            <button
              onClick={() => {
                setShowAddForm(true)
                setEditingVideo(null)
                setFormData({
                  title: '',
                  description: '',
                  content: '',
                  youtubeUrl: '',
                  tags: '',
                  isPublished: false,
                  featured: false
                })
              }}
              className="btn-primary flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Video
            </button>
          </div>
        </div>

        {/* Add/Edit Video Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingVideo ? 'Edit Video' : 'Add New Video'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Video title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Brief description of the video"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Detailed content or notes about the video"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="mental health, anxiety, stress (comma separated)"
                />
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Published</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingVideo(null)
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingVideo ? 'Update Video' : 'Add Video'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-gray-200">
                <img
                  src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Status Badges */}
                <div className="absolute top-2 left-2 flex space-x-1">
                  {video.featured && (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    video.isPublished 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-500 text-white'
                  }`}>
                    {video.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    onClick={() => handleEdit(video)}
                    className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(video._id)}
                    className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {video.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {video.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    <span>{video.viewCount} views</span>
                  </div>
                  <button
                    onClick={() => togglePublishStatus(video)}
                    className={`px-2 py-1 rounded text-xs ${
                      video.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {video.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {videos.length === 0 && (
          <div className="text-center py-12">
            <Youtube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No videos yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first YouTube video resource</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              Add Your First Video
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminVideoManager
