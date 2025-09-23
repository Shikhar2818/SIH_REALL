import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface YouTubeAudioPlayerProps {
  videoId: string;
  title?: string;
  thumbnailUrl?: string;
  onClose?: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const YouTubeAudioPlayer: React.FC<YouTubeAudioPlayerProps> = ({ videoId, title, thumbnailUrl, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<any>(null);
  const iframeRef = useRef<HTMLDivElement>(null);

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      if (iframeRef.current) {
        playerRef.current = new window.YT.Player(iframeRef.current, {
          height: '0',
          width: '0',
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            showinfo: 0,
            loop: 0,
          },
          events: {
            onReady: (event: any) => {
              setIsReady(true);
              setDuration(event.target.getDuration());
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                startProgressTracking();
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
                stopProgressTracking();
              } else if (event.data === window.YT.PlayerState.ENDED) {
                setIsPlaying(false);
                setCurrentTime(0);
                stopProgressTracking();
              }
            }
          }
        });
      }
    };

    // If API is already loaded
    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  const startProgressTracking = () => {
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 1000);
    (window as any).progressInterval = interval;
  };

  const stopProgressTracking = () => {
    if ((window as any).progressInterval) {
      clearInterval((window as any).progressInterval);
      (window as any).progressInterval = null;
    }
  };

  const handlePlayPause = () => {
    if (!isReady || !playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleSkipBack = () => {
    if (!isReady || !playerRef.current) return;
    const newTime = Math.max(0, currentTime - 10);
    playerRef.current.seekTo(newTime, true);
  };

  const handleSkipForward = () => {
    if (!isReady || !playerRef.current) return;
    const newTime = Math.min(duration, currentTime + 10);
    playerRef.current.seekTo(newTime, true);
  };

  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isReady || !playerRef.current) return;
    const newTime = parseFloat(e.target.value);
    playerRef.current.seekTo(newTime, true);
  };

  const handleTimelineMouseDown = () => {
    stopProgressTracking();
  };

  const handleTimelineMouseUp = () => {
    if (isPlaying) {
      startProgressTracking();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg p-6 text-white">
      {/* Hidden YouTube Player */}
      <div ref={iframeRef} style={{ display: 'none' }}></div>
      
      {/* Loading State */}
      {!isReady && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-300">Loading audio player...</p>
        </div>
      )}
      
      {/* Audio Player Interface */}
      {isReady && (
        <>
        <div className="mb-6">
        {/* Thumbnail Display */}
        <div className="relative">
          <img
            src={thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title || 'Audio Thumbnail'}
            className="w-full h-48 object-cover rounded-lg shadow-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Volume2 className="w-12 h-12 mx-auto mb-2 opacity-80" />
              <p className="text-sm opacity-90">Audio Content</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Audio Controls */}
      <div className="space-y-4">
        {/* Title */}
        {title && (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
          </div>
        )}

        {/* Timeline/Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300 w-10">{formatTime(currentTime)}</span>
            <div className="flex-1 relative">
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleTimelineChange}
                onMouseDown={handleTimelineMouseDown}
                onMouseUp={handleTimelineMouseUp}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
                }}
              />
            </div>
            <span className="text-sm text-gray-300 w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={handleSkipBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Skip back 10s"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          
          <button
            onClick={handlePlayPause}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </button>
          
          <button
            onClick={handleSkipForward}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Skip forward 10s"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="text-center text-gray-300 text-sm bg-white/10 rounded-lg p-3">
          <p className="mb-1">Click play to start listening to the audio</p>
          <p className="text-xs">YouTube audio player for mental health content</p>
        </div>

        {/* Close Button */}
        {onClose && (
          <div className="flex justify-center pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Close Player</span>
            </button>
          </div>
        )}
      </div>
        </>
      )}

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(139, 92, 246, 0.4);
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
        }
        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(139, 92, 246, 0.4);
        }
        .slider::-webkit-slider-track {
          background: transparent;
        }
        .slider::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default YouTubeAudioPlayer;
