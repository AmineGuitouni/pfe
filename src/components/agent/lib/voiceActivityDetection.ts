/**
 * Voice Activity Detection (VAD) Engine
 * Implements sophisticated speech detection with noise filtering
 */

export interface VADConfig {
  sampleRate: number;
  frameSize: number;
  energyThreshold: number;
  silenceThreshold: number; // milliseconds
  maxRecordingDuration: number; // milliseconds
  noiseFloorCalibrationTime: number; // milliseconds
}

export interface VADState {
  isCalibrating: boolean;
  isListening: boolean;
  isRecording: boolean;
  noiseFloor: number;
  energyThreshold: number;
  lastSpeechTime: number;
  recordingStartTime: number;
}

export interface AudioFeatures {
  energy: number;
  zeroCrossingRate: number;
  spectralCentroid: number;
}

export class VoiceActivityDetector {
  private config: VADConfig;
  private state: VADState;
  private audioContext: AudioContext;
  private analyserNode: AnalyserNode;
  private dataArray: Float32Array;
  private energyHistory: number[] = [];
  private calibrationSamples: number[] = [];
  
  constructor(config: Partial<VADConfig> = {}) {
    this.config = {
      sampleRate: 16000,
      frameSize: 256,
      energyThreshold: 0.01,
      silenceThreshold: 2000, // 2 seconds
      maxRecordingDuration: 30000, // 30 seconds
      noiseFloorCalibrationTime: 2000, // 2 seconds
      ...config
    };

    this.state = {
      isCalibrating: false,
      isListening: false,
      isRecording: false,
      noiseFloor: 0,
      energyThreshold: this.config.energyThreshold,
      lastSpeechTime: 0,
      recordingStartTime: 0,
    };

    // Initialize Web Audio API
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = this.config.frameSize * 2;
    this.analyserNode.smoothingTimeConstant = 0.3;
    this.dataArray = new Float32Array(this.analyserNode.frequencyBinCount);
  }

  /**
   * Initialize VAD with microphone stream
   */
  async initialize(stream: MediaStream): Promise<void> {
    console.log('🎯 Initializing VAD with audio stream...');
    
    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.analyserNode);
    
    console.log('🎯 Audio context created and connected:', {
      sampleRate: this.audioContext.sampleRate,
      state: this.audioContext.state,
      analyserFFTSize: this.analyserNode.fftSize
    });
    
    // Start noise floor calibration
    console.log('🎯 Starting noise floor calibration...');
    await this.calibrateNoiseFloor();
  }

  /**
   * Calibrate noise floor for adaptive threshold
   */
  private async calibrateNoiseFloor(): Promise<void> {
    this.state.isCalibrating = true;
    this.calibrationSamples = [];
    
    const calibrationStart = Date.now();
    
    return new Promise((resolve) => {
      const calibrationInterval = setInterval(() => {
        const features = this.extractFeatures();
        this.calibrationSamples.push(features.energy);
        
        if (Date.now() - calibrationStart >= this.config.noiseFloorCalibrationTime) {
          clearInterval(calibrationInterval);
          
          // Calculate noise floor as mean + 2*std of calibration samples
          const mean = this.calibrationSamples.reduce((a, b) => a + b, 0) / this.calibrationSamples.length;
          const variance = this.calibrationSamples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.calibrationSamples.length;
          const std = Math.sqrt(variance);
          
          this.state.noiseFloor = mean;
          this.state.energyThreshold = Math.max(mean + 2 * std, this.config.energyThreshold);
          this.state.isCalibrating = false;
          this.state.isListening = true;
          
          resolve();
        }
      }, 50); // Check every 50ms during calibration
    });
  }

  /**
   * Extract audio features for VAD decision
   */
  private extractFeatures(): AudioFeatures {
    this.analyserNode.getFloatTimeDomainData(this.dataArray);
    
    // Calculate energy (RMS)
    let energy = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      energy += this.dataArray[i] * this.dataArray[i];
    }
    energy = Math.sqrt(energy / this.dataArray.length);
    
    // Calculate zero crossing rate
    let zeroCrossings = 0;
    for (let i = 1; i < this.dataArray.length; i++) {
      if ((this.dataArray[i] >= 0) !== (this.dataArray[i - 1] >= 0)) {
        zeroCrossings++;
      }
    }
    const zeroCrossingRate = zeroCrossings / this.dataArray.length;
    
    // Calculate spectral centroid (simplified)
    this.analyserNode.getFloatFrequencyData(this.dataArray);
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < this.dataArray.length; i++) {
      const magnitude = Math.pow(10, this.dataArray[i] / 20); // Convert dB to linear
      const frequency = (i * this.config.sampleRate) / (2 * this.dataArray.length);
      weightedSum += frequency * magnitude;
      magnitudeSum += magnitude;
    }
    
    const spectralCentroid = magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
    
    return {
      energy,
      zeroCrossingRate,
      spectralCentroid
    };
  }

  /**
   * Make VAD decision based on features
   */
  private isSpeech(features: AudioFeatures): boolean {
    // Multi-feature speech detection
    const energyCondition = features.energy > this.state.energyThreshold;
    const zcrCondition = features.zeroCrossingRate > 0.1 && features.zeroCrossingRate < 0.8;
    const spectralCondition = features.spectralCentroid > 500 && features.spectralCentroid < 4000;
    
    // Apply hysteresis to prevent rapid switching
    if (this.state.isRecording) {
      // Lower threshold to continue recording
      return energyCondition && (zcrCondition || spectralCondition);
    } else {
      // Higher threshold to start recording
      return energyCondition && zcrCondition && spectralCondition;
    }
  }

  /**
   * Process audio frame and return VAD decision
   */
  processFrame(): {
    isSpeech: boolean;
    shouldStartRecording: boolean;
    shouldStopRecording: boolean;
    features: AudioFeatures;
  } {
    if (this.state.isCalibrating || !this.state.isListening) {
      return {
        isSpeech: false,
        shouldStartRecording: false,
        shouldStopRecording: false,
        features: { energy: 0, zeroCrossingRate: 0, spectralCentroid: 0 }
      };
    }

    const features = this.extractFeatures();
    const isSpeech = this.isSpeech(features);
    const currentTime = Date.now();
    
    let shouldStartRecording = false;
    let shouldStopRecording = false;
    
    if (isSpeech) {
      this.state.lastSpeechTime = currentTime;
      
      if (!this.state.isRecording) {
        shouldStartRecording = true;
        this.state.isRecording = true;
        this.state.recordingStartTime = currentTime;
      }
    } else {
      // Check silence threshold
      if (this.state.isRecording) {
        const silenceDuration = currentTime - this.state.lastSpeechTime;
        const recordingDuration = currentTime - this.state.recordingStartTime;
        
        if (silenceDuration >= this.config.silenceThreshold || 
            recordingDuration >= this.config.maxRecordingDuration) {
          shouldStopRecording = true;
          this.state.isRecording = false;
        }
      }
    }
    
    // Keep energy history for adaptive threshold adjustment
    this.energyHistory.push(features.energy);
    if (this.energyHistory.length > 100) {
      this.energyHistory.shift();
    }
    
    return {
      isSpeech,
      shouldStartRecording,
      shouldStopRecording,
      features
    };
  }

  /**
   * Get current VAD state
   */
  getState(): VADState {
    return { ...this.state };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<VADConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }

  /**
   * Reset VAD state
   */
  reset(): void {
    this.state.isRecording = false;
    this.state.lastSpeechTime = 0;
    this.state.recordingStartTime = 0;
    this.energyHistory = [];
  }
}