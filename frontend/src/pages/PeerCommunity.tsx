import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import { formatDateTime } from '../utils/date'
import { 
  Plus, 
  Heart, 
  MessageCircle, 
  Filter, 
  Search,
  Users,
  TrendingUp,
  Calendar,
  User,
  Eye,
  EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ForumPost {
  _id: string
  title: string
  content: string
  category: string
  mood?: string
  tags: string[]
  likes: any[]
  comments: any[]
  isAnonymous: boolean
  authorId: {
    _id: string
    name: string
    role: string
  }
  createdAt: string
}

const PeerCommunity = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedMood, setSelectedMood] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [newComments, setNewComments] = useState<Record<string, string>>({})

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    mood: '',
    tags: '',
    isAnonymous: false,
  })

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'anxiety', label: 'Anxiety' },
    { value: 'depression', label: 'Depression' },
    { value: 'stress', label: 'Stress' },
    { value: 'support', label: 'Support' },
    { value: 'achievement', label: 'Achievement' },
  ]

  const moods = [
    { value: 'all', label: 'All Moods' },
    { value: 'happy', label: 'Happy' },
    { value: 'calm', label: 'Calm' },
    { value: 'anxious', label: 'Anxious' },
    { value: 'stressed', label: 'Stressed' },
    { value: 'sad', label: 'Sad' },
    { value: 'overwhelmed', label: 'Overwhelmed' },
  ]

  useEffect(() => {
    fetchPosts()
  }, [selectedCategory, selectedMood])

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedMood !== 'all') params.append('mood', selectedMood)
      
      const response = await api.get(`/forum/posts?${params.toString()}&limit=100`)
      setPosts(response.data.posts)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      toast.error('Failed to load community posts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const postData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        isAnonymous: formData.isAnonymous,
        ...(formData.mood && { mood: formData.mood }), // Only include mood if it's not empty
      }

      await api.post('/forum/posts', postData)
      toast.success('Post created successfully!')
      setShowCreateForm(false)
      setFormData({
        title: '',
        content: '',
        category: 'general',
        mood: '',
        tags: '',
        isAnonymous: false,
      })
      fetchPosts()
    } catch (error: any) {
      console.error('Failed to create post:', error)
      toast.error(error.response?.data?.error || 'Failed to create post')
    }
  }

  const handleLikePost = async (postId: string) => {
    try {
      await api.post(`/forum/posts/${postId}/like`)
      fetchPosts()
    } catch (error) {
      console.error('Failed to like post:', error)
      toast.error('Failed to like post')
    }
  }

  const handleToggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments)
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId)
    } else {
      newExpanded.add(postId)
    }
    setExpandedComments(newExpanded)
  }

  const handleCommentChange = (postId: string, content: string) => {
    setNewComments(prev => ({
      ...prev,
      [postId]: content
    }))
  }

  const handleSubmitComment = async (postId: string) => {
    const commentContent = newComments[postId]
    if (!commentContent?.trim()) {
      toast.error('Please enter a comment')
      return
    }

    try {
      await api.post(`/forum/posts/${postId}/comments`, {
        content: commentContent.trim()
      })
      
      // Clear the comment input
      setNewComments(prev => {
        const updated = { ...prev }
        delete updated[postId]
        return updated
      })
      
      // Refresh posts to get updated comments
      fetchPosts()
      toast.success('Comment added successfully')
    } catch (error) {
      console.error('Failed to add comment:', error)
      toast.error('Failed to add comment')
    }
  }

  const filteredPosts = posts.filter(post => {
    if (searchTerm) {
      return post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
             post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    }
    return true
  })

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-gray-100 text-gray-800',
      anxiety: 'bg-yellow-100 text-yellow-800',
      depression: 'bg-blue-100 text-blue-800',
      stress: 'bg-red-100 text-red-800',
      support: 'bg-green-100 text-green-800',
      achievement: 'bg-purple-100 text-purple-800',
    }
    return colors[category] || colors.general
  }

  const getMoodEmoji = (mood?: string) => {
    const emojis: Record<string, string> = {
      happy: '😊',
      calm: '😌',
      anxious: '😰',
      stressed: '😤',
      sad: '😢',
      overwhelmed: '😵',
    }
    return mood ? emojis[mood] || '😐' : ''
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Peer Community</h1>
              <p className="text-gray-600">
                Connect with other students, share experiences, and support each other
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Post</span>
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              className="input-field"
            >
              {moods.map(mood => (
                <option key={mood.value} value={mood.value}>
                  {mood.label}
                </option>
              ))}
            </select>

            <div className="flex items-center text-sm text-gray-600">
              <span>{filteredPosts.length} posts found</span>
            </div>
          </div>
        </motion.div>

        {/* Posts */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-600">
                Be the first to share something with the community!
              </p>
            </motion.div>
          ) : (
            filteredPosts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          {post.isAnonymous ? 'Anonymous Student' : post.authorId.name}
                        </h3>
                        {post.mood && (
                          <span className="text-lg">{getMoodEmoji(post.mood)}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{formatDateTime(post.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                    {post.isAnonymous && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <EyeOff className="w-3 h-3" />
                        <span>Anonymous</span>
                      </div>
                    )}
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLikePost(post._id)}
                      className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span>{post.likes.length}</span>
                    </button>
                    <button
                      onClick={() => handleToggleComments(post._id)}
                      className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments.length}</span>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                {expandedComments.has(post._id) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {/* Existing Comments */}
                    {post.comments.length > 0 ? (
                      <div className="space-y-3 mb-4">
                        {post.comments.map((comment: any, commentIndex: number) => (
                          <div key={commentIndex} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-primary-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900">
                                    {comment.authorId?.name || 'Anonymous'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatDateTime(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm mb-4">No comments yet. Be the first to comment!</p>
                    )}

                    {/* Add Comment Form */}
                    {user && (
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            value={newComments[post._id] || ''}
                            onChange={(e) => handleCommentChange(post._id, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                            maxLength={500}
                          />
                          <button
                            onClick={() => handleSubmitComment(post._id)}
                            disabled={!newComments[post._id]?.trim()}
                            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Create Post Modal */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create New Post</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    placeholder="What's on your mind?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="input-field h-32 resize-none"
                    placeholder="Share your thoughts, experiences, or ask for advice..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-field"
                    >
                      {categories.slice(1).map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Mood (Optional)
                    </label>
                    <select
                      value={formData.mood}
                      onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select mood</option>
                      {moods.slice(1).map(mood => (
                        <option key={mood.value} value={mood.value}>
                          {getMoodEmoji(mood.value)} {mood.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="input-field"
                    placeholder="Enter tags separated by commas (e.g., anxiety, study, support)"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-900">
                    Post anonymously
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Create Post
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default PeerCommunity
