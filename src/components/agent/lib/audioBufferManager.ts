/**
 * Audio Buffer Manager
 * Handles continuous audio recording and speech segment extraction
 */

export interface AudioSegment {
  id: string;
  audioData: Blob;
  startTime: number;
  endTime: number;
  duration: number;
}

export interface BufferConfig {
  maxBufferSize: number; // Maximum buffer size in bytes
  segmentOverlap: number; // Overlap between segments in milliseconds
  minSegmentDuration: number; // Minimum segment duration in milliseconds
}

export class AudioBufferManager {
  private config: BufferConfig;
  private audioChunks: Blob[] = [];
  private recordingStartTime: number = 0;
  private segmentCounter: number = 0;
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;

  constructor(config: Partial<BufferConfig> = {}) {
    this.config = {
      maxBufferSize: 10 * 1024 * 1024, // 10MB
      segmentOverlap: 500, // 500ms overlap
      minSegmentDuration: 1000, // 1 second minimum
      ...config
    };
  }

  /**
   * Initialize continuous recording
   */
  async startContinuousRecording(stream: MediaStream, mimeType: string): Promise<void> {
    console.log('🎵 Starting continuous recording with:', { mimeType, streamActive: stream.active });
    
    this.stream = stream;
    this.audioChunks = [];
    this.recordingStartTime = Date.now();

    // Create MediaRecorder for continuous recording
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: mimeType
    });

    console.log('🎵 MediaRecorder created with state:', this.mediaRecorder.state);

    this.mediaRecorder.ondataavailable = (event) => {
      // Validate audio chunk before adding to buffer
      if (event.data && event.data.size > 0) {
        // Check for reasonable chunk size (not too small, not too large)
        const MIN_CHUNK_SIZE = 100; // 100 bytes minimum
        const MAX_CHUNK_SIZE = 1024 * 1024; // 1MB maximum
        
        if (event.data.size >= MIN_CHUNK_SIZE && event.data.size <= MAX_CHUNK_SIZE) {
          this.audioChunks.push(event.data);
          this.manageBufferSize();
          
          // console.log('🎵 Valid audio chunk added:', {
          //   size: event.data.size,
          //   type: event.data.type,
          //   totalChunks: this.audioChunks.length
          // });
        } else {
          console.warn('🎵 Audio chunk size out of valid range:', {
            size: event.data.size,
            min: MIN_CHUNK_SIZE,
            max: MAX_CHUNK_SIZE
          });
        }
      } else {
        console.warn('🎵 Received invalid or empty audio chunk:', {
          hasData: !!event.data,
          size: event.data?.size || 0
        });
      }
    };

    this.mediaRecorder.onstart = () => {
      console.log('🎵 MediaRecorder started successfully');
    };

    this.mediaRecorder.onstop = () => {
      console.log('🎵 MediaRecorder stopped');
    };

    this.mediaRecorder.onerror = (event) => {
      console.error('🎵 MediaRecorder error:', event);
    };

    // Start recording with small time slices for real-time processing
    this.mediaRecorder.start(100); // 100ms time slices
    
    console.log('🎵 Continuous recording start command issued, current state:', this.mediaRecorder.state);
  }

  /**
   * Extract audio segment from buffer
   */
  extractSegment(startOffset: number = 0, endOffset: number = 0): AudioSegment | null {
    if (this.audioChunks.length === 0) {
      return null;
    }

    const currentTime = Date.now();
    const segmentStartTime = this.recordingStartTime + startOffset;
    const segmentEndTime = endOffset > 0 ? this.recordingStartTime + endOffset : currentTime;
    const duration = segmentEndTime - segmentStartTime;

    // Check minimum duration
    if (duration < this.config.minSegmentDuration) {
      console.log('Segment too short, skipping extraction');
      return null;
    }

    // Create blob from current chunks
    const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
    const audioBlob = new Blob(this.audioChunks, { type: mimeType });

    const segment: AudioSegment = {
      id: `segment_${++this.segmentCounter}_${Date.now()}`,
      audioData: audioBlob,
      startTime: segmentStartTime,
      endTime: segmentEndTime,
      duration: duration
    };

    console.log('Audio segment extracted:', {
      id: segment.id,
      duration: duration,
      size: audioBlob.size,
      chunksCount: this.audioChunks.length
    });

    return segment;
  }

  /**
   * Extract and clear current buffer (for when speech ends)
   */
  extractAndClearSegment(): AudioSegment | null {
    console.log('🎵 Attempting to extract audio segment, current buffer status:', {
      chunksCount: this.audioChunks.length,
      totalSize: this.audioChunks.reduce((sum, chunk) => sum + chunk.size, 0),
      recordingDuration: Date.now() - this.recordingStartTime
    });
    
    // Validate buffer state before extraction
    if (this.audioChunks.length === 0) {
      console.warn('🎵 Cannot extract segment - buffer is empty');
      return null;
    }

    // Enhanced audio chunks integrity validation
    const originalChunkCount = this.audioChunks.length;
    const corruptedChunks = this.audioChunks.filter(chunk => !chunk || chunk.size === 0);
    const suspiciousChunks = this.audioChunks.filter(chunk => chunk && chunk.size > 0 && chunk.size < 10);
    
    if (corruptedChunks.length > 0) {
      console.warn('🎵 Detected corrupted chunks, filtering them out:', corruptedChunks.length);
      this.audioChunks = this.audioChunks.filter(chunk => chunk && chunk.size > 0);
    }

    if (suspiciousChunks.length > 0) {
      console.warn('🎵 Detected suspiciously small chunks (may be corrupted):', suspiciousChunks.length);
      // Filter out chunks that are too small to contain meaningful audio
      this.audioChunks = this.audioChunks.filter(chunk => chunk && chunk.size >= 10);
    }

    // Check if we have enough valid data after filtering
    const totalValidSize = this.audioChunks.reduce((sum, chunk) => sum + chunk.size, 0);
    if (totalValidSize < 100) {
      console.warn('🎵 Insufficient valid audio data after corruption filtering:', {
        originalChunks: originalChunkCount,
        validChunks: this.audioChunks.length,
        totalValidSize,
        corruptedRemoved: corruptedChunks.length,
        suspiciousRemoved: suspiciousChunks.length
      });
      return null;
    }

    const segment = this.extractSegment();
    
    if (segment) {
      // Additional segment validation
      if (segment.audioData.size < 100) {
        console.warn('🎵 Generated segment too small, likely corrupted:', segment.audioData.size);
        return null;
      }

      console.log('🎵 Audio segment extracted successfully:', {
        id: segment.id,
        duration: segment.duration,
        size: segment.audioData.size,
        chunksUsed: this.audioChunks.length,
        corruptionFiltering: {
          corruptedRemoved: corruptedChunks.length,
          suspiciousRemoved: suspiciousChunks.length,
          originalChunks: originalChunkCount,
          finalChunks: this.audioChunks.length
        }
      });
      
      // Keep a small overlap for continuity, but ensure we don't keep corrupted chunks
      const overlapChunks = Math.min(3, this.audioChunks.length);
      const validOverlapChunks = this.audioChunks.slice(-overlapChunks).filter(chunk => chunk && chunk.size > 10);
      
      this.audioChunks = validOverlapChunks;
      this.recordingStartTime = Date.now() - (validOverlapChunks.length * 100); // Adjust start time
      
      console.log('🎵 Buffer cleared, keeping valid overlap chunks:', validOverlapChunks.length);
    } else {
      console.log('🎵 No audio segment to extract - buffer may be empty or too short');
    }

    return segment;
  }

  /**
   * Manage buffer size to prevent memory issues
   */
  private manageBufferSize(): void {
    const totalSize = this.audioChunks.reduce((sum, chunk) => sum + chunk.size, 0);
    
    if (totalSize > this.config.maxBufferSize) {
      // Remove oldest chunks (keep last 80%)
      const chunksToKeep = Math.floor(this.audioChunks.length * 0.8);
      const removedChunks = this.audioChunks.length - chunksToKeep;
      
      this.audioChunks = this.audioChunks.slice(removedChunks);
      this.recordingStartTime += removedChunks * 100; // Adjust start time
      
      console.log('Buffer size managed:', {
        removedChunks,
        remainingChunks: this.audioChunks.length,
        newTotalSize: this.audioChunks.reduce((sum, chunk) => sum + chunk.size, 0)
      });
    }
  }

  /**
   * Stop continuous recording
   */
  stopContinuousRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    
    console.log('Continuous recording stopped');
  }

  /**
   * Get current buffer status
   */
  getBufferStatus(): {
    chunksCount: number;
    totalSize: number;
    duration: number;
    isRecording: boolean;
  } {
    const totalSize = this.audioChunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const duration = Date.now() - this.recordingStartTime;
    const isRecording = this.mediaRecorder?.state === 'recording';

    return {
      chunksCount: this.audioChunks.length,
      totalSize,
      duration,
      isRecording
    };
  }

  /**
   * Clear all buffered audio
   */
  clearBuffer(): void {
    this.audioChunks = [];
    this.recordingStartTime = Date.now();
    console.log('Audio buffer cleared');
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopContinuousRecording();
    this.audioChunks = [];
    this.mediaRecorder = null;
    this.stream = null;
  }

  /**
   * Get audio chunk at specific time offset
   */
  getChunkAtTime(timeOffset: number): Blob | null {
    const chunkIndex = Math.floor(timeOffset / 100); // 100ms per chunk
    
    if (chunkIndex >= 0 && chunkIndex < this.audioChunks.length) {
      return this.audioChunks[chunkIndex];
    }
    
    return null;
  }

  /**
   * Get chunks within time range
   */
  getChunksInRange(startTime: number, endTime: number): Blob[] {
    const startIndex = Math.floor(startTime / 100);
    const endIndex = Math.ceil(endTime / 100);
    
    const validStartIndex = Math.max(0, startIndex);
    const validEndIndex = Math.min(this.audioChunks.length, endIndex);
    
    return this.audioChunks.slice(validStartIndex, validEndIndex);
  }

  /**
   * Create audio blob from time range
   */
  createBlobFromTimeRange(startTime: number, endTime: number): Blob | null {
    const chunks = this.getChunksInRange(startTime, endTime);
    
    if (chunks.length === 0) {
      return null;
    }
    
    const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
    return new Blob(chunks, { type: mimeType });
  }

  /**
   * Check buffer health and corruption status
   */
  checkBufferHealth(): {
    isHealthy: boolean;
    issues: string[];
    stats: {
      totalChunks: number;
      corruptedChunks: number;
      suspiciousChunks: number;
      totalSize: number;
      averageChunkSize: number;
    };
  } {
    const corruptedChunks = this.audioChunks.filter(chunk => !chunk || chunk.size === 0);
    const suspiciousChunks = this.audioChunks.filter(chunk => chunk && chunk.size > 0 && chunk.size < 10);
    const totalSize = this.audioChunks.reduce((sum, chunk) => sum + (chunk?.size || 0), 0);
    const validChunks = this.audioChunks.filter(chunk => chunk && chunk.size >= 10);
    const averageChunkSize = validChunks.length > 0 ? totalSize / validChunks.length : 0;

    const issues: string[] = [];
    
    if (corruptedChunks.length > 0) {
      issues.push(`${corruptedChunks.length} corrupted chunks detected`);
    }
    
    if (suspiciousChunks.length > 0) {
      issues.push(`${suspiciousChunks.length} suspiciously small chunks detected`);
    }
    
    if (totalSize < 100 && this.audioChunks.length > 0) {
      issues.push('Total buffer size too small for meaningful audio');
    }
    
    if (averageChunkSize < 50 && validChunks.length > 5) {
      issues.push('Average chunk size unusually small');
    }

    const corruptionRate = this.audioChunks.length > 0 ? 
      (corruptedChunks.length + suspiciousChunks.length) / this.audioChunks.length : 0;
    
    if (corruptionRate > 0.3) {
      issues.push(`High corruption rate: ${(corruptionRate * 100).toFixed(1)}%`);
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      stats: {
        totalChunks: this.audioChunks.length,
        corruptedChunks: corruptedChunks.length,
        suspiciousChunks: suspiciousChunks.length,
        totalSize,
        averageChunkSize
      }
    };
  }
}