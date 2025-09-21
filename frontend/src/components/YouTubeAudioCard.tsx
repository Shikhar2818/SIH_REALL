import React, { useState } from 'react';
import { Play, Music, Volume2, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import YouTubeAudioPlayer from './YouTubeAudioPlayer';

interface YouTubeAudio {
  _id: string;
  title: string;
  description: string;
  youtubeId: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  tags: string[];
  viewCount: number;
  featured?: boolean;
  createdAt: string;
}

interface YouTubeAudioCardProps {
  audio: YouTubeAudio;
}

const YouTubeAudioCard: React.FC<YouTubeAudioCardProps> = ({ audio }) => {
  const [showPlayer, setShowPlayer] = useState(false);

  const handlePlayClick = () => {
    setShowPlayer(true);
  };

  const formatDuration = (duration: string) => {
    if (!duration || duration === 'N/A') return 'Duration unknown';
    return duration;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  return (
    <>
      <motion.div
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        whileHover={{ y: -5 }}
        onClick={handlePlayClick}
      >
        {/* Audio Thumbnail */}
        <div className="relative aspect-video bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <div className="text-center text-white">
            <Music className="w-16 h-16 mx-auto mb-2 opacity-80" />
            <Volume2 className="w-8 h-8 mx-auto opacity-60" />
          </div>
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-white ml-1" />
            </div>
          </div>

          {/* Duration Badge */}
          {audio.duration && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              {audio.duration}
            </div>
          )}

          {/* Featured Badge */}
          {audio.featured && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </div>
          )}
        </div>

        {/* Audio Information */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {audio.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {audio.description}
          </p>

          {/* Tags */}
          {audio.tags && audio.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {audio.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {audio.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{audio.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Meta Information */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              <span>{formatViews(audio.viewCount)}</span>
              <span>•</span>
              <span>{formatDate(audio.createdAt)}</span>
            </div>
            <div className="flex items-center text-purple-600">
              <Volume2 className="w-3 h-3 mr-1" />
              Audio
            </div>
          </div>

          {/* Play Button */}
          <div className="mt-4">
            <button
              onClick={handlePlayClick}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Play Audio</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Audio Player Modal */}
      {showPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Audio Player</h2>
              <button
                onClick={() => setShowPlayer(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-4">
              <YouTubeAudioPlayer
                videoId={audio.youtubeId}
                title={audio.title}
                thumbnailUrl={audio.thumbnailUrl}
                onClose={() => setShowPlayer(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default YouTubeAudioCard;
