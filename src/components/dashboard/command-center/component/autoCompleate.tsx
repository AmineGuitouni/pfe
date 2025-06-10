"use client";
import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import AutoCompleteTextArea from './AutoCompleteTextArea'; 
import { useParams, usePathname } from 'next/navigation';
import { useCommandCenterContext } from '../context/CommandCenterContext';
import { Button } from '@heroui/react';
import { Mic, Square, Upload, Play, Pause } from 'lucide-react';
import { predefinedCommands } from '../constants/contants';

export default function CommandInput() {
  const [textValue, setTextValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  
  const pathName = usePathname()
  const mode: "cli" | "chat" | null = useMemo(()=>{
    const isAgent = pathName.includes('chat')
    if(isAgent) return 'chat';
    const isCli = pathName.includes('cli')
    if(isCli) return 'cli';
    return null
  },[pathName])
  const autocompleteEnabled = useMemo(()=>{
    if(mode === 'cli') return true;
    if(mode === 'chat') return false;
    return textValue.startsWith("@");
  },[textValue, mode])

  

  const {SendMessage, sendingMessage} = useCommandCenterContext();
  const {command_center_session} = useParams();

  const handleSubmit = async () => {
    if (textValue.trim()) {
      setTextValue('');
      await SendMessage(textValue);
    }
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Stop all tracks to turn off microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  }, [isRecording]);

  const discardRecording = useCallback(() => {
    setAudioBlob(null);
    setRecordingTime(0);
    setIsPlaying(false);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      // Clean up the audio source
      if (audioPlayerRef.current.src) {
        URL.revokeObjectURL(audioPlayerRef.current.src);
        audioPlayerRef.current.src = '';
      }
    }
  }, []);

  // Clean up object URLs when component unmounts or audioBlob changes
  useEffect(() => {
    const audioElement = audioPlayerRef.current;
    return () => {
      if (audioElement && audioElement.src) {
        URL.revokeObjectURL(audioElement.src);
      }
    };
  }, [audioBlob]);

  const toggleAudioPlayback = useCallback(async () => {
    if (!audioBlob || !audioPlayerRef.current) {
      console.log('No audio blob or player ref available');
      return;
    }

    try {
      if (isPlaying) {
        audioPlayerRef.current.pause();
        setIsPlaying(false);
      } else {
        // Create a fresh URL for the audio blob
        const audioUrl = URL.createObjectURL(audioBlob);
        
        audioPlayerRef.current.src = audioUrl;
        
        await audioPlayerRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      alert('Could not play audio. Please try again.');
      setIsPlaying(false);
    }
  }, [audioBlob, isPlaying]);

  const uploadAudioMessage = useCallback(async () => {
    if (!audioBlob) return;
    
    setIsUploading(true);
    try {
      // Convert audio blob to base64
      const reader = new FileReader();
      const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Send message with base64 audio and content_type: 'audio'
      await SendMessage(base64Audio, 'audio');
      
      // Clean up
      setAudioBlob(null);
      setRecordingTime(0);
      setIsPlaying(false);
      if (audioPlayerRef.current && audioPlayerRef.current.src) {
        URL.revokeObjectURL(audioPlayerRef.current.src);
        audioPlayerRef.current.src = '';
      }
      
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Failed to process audio message. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [audioBlob, SendMessage]);

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mb-4 flex flex-col items-center mx-auto w-full max-w-[1200px] px-4 md:px-6 lg:px-14 xl:px-24 2xl:px-28">

      <div className="w-full px-3">
        {/* Show audio recording controls if we have a recorded audio blob */}
        {audioBlob ? (
          <div className="mb-4 p-4 bg-modal_bg border border-light_blue/20 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Mic className="text-light_blue-500" size={20} />
                <span className="text-white">Audio recorded ({formatRecordingTime(recordingTime)})</span>
              </div>
              <Button
                size="sm"
                variant="light"
                onPress={discardRecording}
                className="text-red-400 hover:text-red-300"
              >
                Discard
              </Button>
            </div>
            
            {/* Audio player */}
            <audio
              ref={audioPlayerRef}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onError={(e) => {
                console.error('Audio playback error:', e);
                setIsPlaying(false);
              }}
              className="hidden"
            />
            
            <div className="flex gap-2">
              {/* Play/Pause button */}
              <Button
                onPress={toggleAudioPlayback}
                className="bg-dark_blue border border-light_blue/30 hover:bg-light_blue/10 text-light_blue"
                startContent={isPlaying ? <Pause size={16} /> : <Play size={16} />}
              >
                {isPlaying ? 'Pause' : 'Preview'}
              </Button>
              
              <Button
                onPress={uploadAudioMessage}
                isDisabled={isUploading || sendingMessage}
                isLoading={isUploading}
                className="bg-light_blue hover:bg-light_blue-500 text-black flex-1"
                startContent={<Upload size={16} />}
              >
                {isUploading ? 'Uploading...' : 'Send Audio Message'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <AutoCompleteTextArea
              value={textValue}
              onValueChange={setTextValue}
              commands={predefinedCommands}
              enableAutocomplete={autocompleteEnabled}
              placeholder={mode === 'cli' ? "Enter CLI command..." : mode === 'chat' ? "Type your message..." : "Type @ for commands or enter text..."}
              rows={command_center_session ? 3 : 8}
              onSubmit={handleSubmit}
              submitDisabled={sendingMessage}
            />
            <div className="flex gap-2 mt-2">
              <Button
                onPress={handleSubmit}
                isDisabled={sendingMessage || isRecording}
                isLoading={sendingMessage}
                className="bg-light_blue hover:bg-light_blue-500 text-black flex-1"
              >
                {mode === 'cli' ? 'Execute Command' : mode === 'chat' ? 'Send Message' : 'Send'}
              </Button>
              
              {/* Audio recording button */}
              <Button
                onPress={isRecording ? stopRecording : startRecording}
                isDisabled={sendingMessage}
                className={`${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-dark_blue border border-light_blue/30 hover:bg-light_blue/10 text-light_blue'
                }`}
                isIconOnly
              >
                {isRecording ? <Square size={20} /> : <Mic size={20} />}
              </Button>
            </div>
            
            {/* Recording indicator */}
            {isRecording && (
              <div className="mt-2 flex items-center justify-center gap-2 text-red-400">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Recording... {formatRecordingTime(recordingTime)}</span>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
