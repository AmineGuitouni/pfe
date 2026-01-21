'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, Download, Volume2 } from 'lucide-react';
import { getAudioUrl, cleanupBlobUrl } from '@/lib/utils/audioUtils';
import { STYLING } from '../../lib/constants';

interface AudioMessageProps {
  audioUrl: string;
  duration?: number;
  isOwnMessage?: boolean;
  onError?: (error: string) => void;
}

export const AudioMessage: React.FC<AudioMessageProps> = ({ 
  audioUrl, 
  duration, 
  isOwnMessage = false, 
  onError 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Check browser support for audio formats
  const checkAudioSupport = (url: string) => {
    const audio = document.createElement('audio');
    
    const isWebM = url.includes('.webm') || url.includes('audio/webm');
    const isMP3 = url.includes('.mp3') || url.includes('audio/mp3');
    const isWAV = url.includes('.wav') || url.includes('audio/wav');
    const isOGG = url.includes('.ogg') || url.includes('audio/ogg');

    const support = {
      webm: audio.canPlayType('audio/webm'),
      mp3: audio.canPlayType('audio/mp3'),
      wav: audio.canPlayType('audio/wav'),
      ogg: audio.canPlayType('audio/ogg')
    };

    if (isWebM && (support.webm === '' || support.webm === 'maybe')) {
      return { supported: false, format: 'WebM', reason: 'Browser has unreliable WebM audio support' };
    }
    if (isMP3 && support.mp3 === '') {
      return { supported: false, format: 'MP3', reason: 'Browser does not support MP3 audio format' };
    }
    if (isWAV && support.wav === '') {
      return { supported: false, format: 'WAV', reason: 'Browser does not support WAV audio format' };
    }
    if (isOGG && support.ogg === '') {
      return { supported: false, format: 'OGG', reason: 'Browser does not support OGG audio format' };
    }

    return { supported: true };
  };

  // Process audio URL (handle both regular URLs and base64 data)
  const processedAudio = useMemo(() => {
    try {
      if (!audioUrl || typeof audioUrl !== 'string' || audioUrl.trim().length === 0) {
        throw new Error('Empty or invalid audio URL provided');
      }

      const result = getAudioUrl(audioUrl);
      
      const supportCheck = checkAudioSupport(result.url);
      if (!supportCheck.supported) {
        return { ...result, unsupported: true, supportError: supportCheck };
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid audio content';
      onError?.(errorMessage);
      return null;
    }
  }, [audioUrl, onError]);

  // Cleanup blob URL on unmount or when URL changes
  useEffect(() => {
    return () => {
      if (processedAudio?.needsCleanup) {
        cleanupBlobUrl(processedAudio.url);
      }
    };
  }, [processedAudio]);

  // Set error state if processing failed
  useEffect(() => {
    if (!processedAudio) {
      setHasError(true);
      setIsLoading(false);
    }
  }, [processedAudio]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      setAudioDuration(audioRef.current.duration);
      setIsLoading(false);
      setHasError(false);
    }
  };

  const handleError = (event: any) => {
    console.error('Audio loading error:', {
      error: event,
      audioSrc: processedAudio?.url,
      audioElement: audioRef.current,
      networkState: audioRef.current?.networkState,
      readyState: audioRef.current?.readyState,
      errorCode: audioRef.current?.error?.code,
      errorMessage: audioRef.current?.error?.message
    });
    
    setHasError(true);
    setIsLoading(false);
    setIsPlaying(false);
    onError?.(`Failed to load audio file: ${audioRef.current?.error?.message || 'Unknown error'}`);
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const newTime = percentage * audioDuration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    if (!time || !isFinite(time)) {
      return '0:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  const handleDownload = () => {
    if (!processedAudio) return;
    
    const link = document.createElement('a');
    link.href = processedAudio.url;
    link.download = 'audio-message.wav';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Don't render if audio processing failed
  if (!processedAudio) {
    return (
      <div className={`flex items-center gap-2 p-3 rounded-lg border max-w-xs ${
        isOwnMessage
          ? 'bg-red-500/20 border-red-500/30'
          : 'bg-red-500/10 border-red-500/20'
      }`}>
        <div className="text-red-400 text-xs">
          🎵 Audio unavailable
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border max-w-xs ${
      isOwnMessage 
        ? `${STYLING.COLORS.USER_MESSAGE} border-light_blue-400/30` 
        : `${STYLING.COLORS.AI_MESSAGE} ${STYLING.COLORS.BORDER}`
    }`}>
      <audio
        ref={audioRef}
        src={processedAudio.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
        crossOrigin="anonymous"
      />
      
      {/* Play/Pause Button */}
      <button
        className={`
          flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 transition-colors duration-200
          ${hasError || isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : `${STYLING.COLORS.BUTTON_PRIMARY} hover:bg-light_blue-600 ${STYLING.COLORS.BUTTON_TEXT}`
          }
        `}
        onClick={handlePlayPause}
        disabled={hasError || isLoading}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>

      {/* Audio Progress and Info */}
      <div className="flex-1 min-w-0">
        {/* Progress Bar */}
        <div 
          className={`h-2 bg-white/20 rounded-full cursor-pointer mb-1 border ${STYLING.COLORS.BORDER}`}
          onClick={handleSeek}
        >
          <div 
            className={`h-full ${STYLING.COLORS.BUTTON_PRIMARY} rounded-full transition-all duration-100`}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Time Display */}
        <div className={`flex items-center justify-between text-xs ${isOwnMessage ? STYLING.COLORS.BUTTON_TEXT : STYLING.COLORS.TEXT_SECONDARY}`}>
          <span>{formatTime(currentTime)}</span>
          <span>
            {hasError ? 'Error' : isLoading ? 'Loading...' : formatTime(audioDuration)}
          </span>
        </div>
      </div>

      {/* Download Button */}
      <button
        className={`
          flex items-center justify-center w-6 h-6 rounded flex-shrink-0 transition-colors duration-200
          ${isOwnMessage 
            ? `${STYLING.COLORS.BUTTON_TEXT} hover:bg-white/10` 
            : `${STYLING.COLORS.TEXT_SECONDARY} hover:${STYLING.COLORS.TEXT_PRIMARY} hover:bg-white/10`
          }
        `}
        onClick={handleDownload}
        title="Download audio"
      >
        <Download size={14} />
      </button>

      {/* Audio Icon */}
      <Volume2 size={16} className={`${STYLING.COLORS.TEXT_PRIMARY} flex-shrink-0`} />
    </div>
  );
};