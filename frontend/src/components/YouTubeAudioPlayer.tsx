import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';

interface YouTubeAudioPlayerProps {
  videoId: string;
  title?: string;
  thumbnailUrl?: string;
  onClose?: () => void;
}

const YouTubeAudioPlayer: React.FC<YouTubeAudioPlayerProps> = ({ videoId, title, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Create YouTube embed URL that starts playing immediately when clicked
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&modestbranding=1&rel=0&showinfo=0&fs=0&cc_load_policy=0&iv_load_policy=3&autohide=0&playsinline=1&enablejsapi=1&origin=${window.location.origin}`;

  return (
    <div className="bg-gray-900 rounded-lg p-6 text-white">
      {/* YouTube Player with Audio Focus */}
      <div className="mb-4 relative">
        <iframe
          width="100%"
          height="200"
          src={embedUrl}
          title={title || 'Audio Player'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-lg"
        />
        {/* Audio-only indicator */}
        <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs flex items-center">
          <Volume2 className="w-3 h-3 mr-1" />
          Audio
        </div>
      </div>
      
      {/* Title and Instructions */}
      <div className="space-y-4">
        {/* Title */}
        {title && (
          <div className="text-center">
            <h3 className="text-lg font-semibold truncate">{title}</h3>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center text-gray-300 text-sm">
          <p>Click the play button in the video above to start listening to the audio.</p>
          <p className="text-xs mt-1">The video will show the thumbnail while you listen to the audio content.</p>
        </div>

        {/* Close Button */}
        {onClose && (
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Close Player
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeAudioPlayer;
