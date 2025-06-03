import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@heroui/react';
import { Play, Pause, Download, Volume2 } from 'lucide-react';
import { getAudioUrl, cleanupBlobUrl } from '@/lib/utils/audioUtils';

interface AudioMessageProps {
  audioUrl: string;
  duration?: number;
  isOwnMessage?: boolean;
  onError?: (error: string) => void;
}

export default function AudioMessage({ audioUrl, duration, isOwnMessage = false, onError }: AudioMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Check browser support for audio formats
  const checkAudioSupport = (url: string) => {
    const audio = document.createElement('audio');
    
    // Extract file extension or content type
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


    // For WebM, "maybe" support often doesn't work reliably in practice
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
      // First, let's check if we have valid input
      if (!audioUrl || typeof audioUrl !== 'string' || audioUrl.trim().length === 0) {
        throw new Error('Empty or invalid audio URL provided');
      }

      const result = getAudioUrl(audioUrl);
      
      // Check if browser supports this audio format
      const supportCheck = checkAudioSupport(result.url);
      if (!supportCheck.supported) {
        // Audio format not supported - handle silently
        return { ...result, unsupported: true, supportError: supportCheck };
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid audio content';
      // Handle processing error silently
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

  // Don't render if audio processing failed - return a more user-friendly error
  if (!processedAudio) {
    return (
      <div className={`flex items-center gap-2 p-3 rounded-lg ${
        isOwnMessage
          ? 'bg-red-500/20 border border-red-500/30'
          : 'bg-red-500/10 border border-red-500/20'
      } max-w-xs`}>
        <div className="text-red-400 text-xs">
          🎵 Audio unavailable
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${
      isOwnMessage 
        ? 'bg-light_blue-500/20 border border-light_blue-500/30' 
        : 'bg-white/5 border border-white/10'
    } max-w-xs`}>
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
      <Button
        isIconOnly
        size="sm"
        className="bg-light_blue-500 hover:bg-light_blue text-dark_blue flex-shrink-0"
        onPress={handlePlayPause}
        isDisabled={hasError || isLoading}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </Button>

      {/* Audio Progress and Info */}
      <div className="flex-1 min-w-0">
        {/* Progress Bar */}
        <div 
          className="h-2 bg-white/20 rounded-full cursor-pointer mb-1"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-light_blue-500 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Time Display */}
        <div className="flex items-center justify-between text-xs text-black">
          <span>{formatTime(currentTime)}</span>
          <span>
            {hasError ? 'Error' : isLoading ? 'Loading...' : formatTime(audioDuration)}
          </span>
        </div>
      </div>

      {/* Download Button */}
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        className="text-black hover:text-black hover:bg-white/10 flex-shrink-0"
        onPress={handleDownload}
      >
        <Download size={14} />
      </Button>

      {/* Audio Icon */}
      <Volume2 size={16} className="text-light_blue-500 flex-shrink-0" />
    </div>
  );
}
