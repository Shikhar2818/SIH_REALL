import React, { useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react'

interface YouTubePlayerProps {
  videoId: string
  title?: string
  width?: string | number
  height?: string | number
  autoplay?: boolean
  className?: string
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  title = '',
  width = '100%',
  height = '400',
  autoplay = false,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)

  // YouTube embed URL
  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const handleMuteToggle = () => {
    if (isMuted) {
      setIsMuted(false)
      setVolume(50)
    } else {
      setIsMuted(true)
      setVolume(0)
    }
  }

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime)
  }

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Video Container */}
      <div className="relative group">
        <iframe
          src={embedUrl}
          width={width}
          height={height}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full"
          title={title}
        />
        
        {/* Custom Overlay Controls */}
        <div 
          className={`absolute inset-0 bg-black bg-opacity-20 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          } group-hover:opacity-100`}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* Video Title */}
          {title && (
            <div className="absolute top-4 left-4 right-4">
              <h3 className="text-white text-lg font-semibold bg-black bg-opacity-50 px-3 py-2 rounded-md backdrop-blur-sm">
                {title}
              </h3>
            </div>
          )}

          {/* Play/Pause Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlayPause}
              className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-4 transition-all duration-200 backdrop-blur-sm"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </button>
          </div>

          {/* Bottom Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-3">
              <div className="w-full bg-gray-600 rounded-full h-1 cursor-pointer">
                <div 
                  className="bg-red-600 h-1 rounded-full transition-all duration-200"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Play/Pause */}
                <button
                  onClick={handlePlayPause}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>

                {/* Volume */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleMuteToggle}
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Time Display */}
                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Settings */}
                <button className="text-white hover:text-gray-300 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={handleFullscreen}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Information */}
      <div className="p-4 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>YouTube Video</span>
          <span>HD Quality</span>
        </div>
      </div>
    </div>
  )
}

export default YouTubePlayer
