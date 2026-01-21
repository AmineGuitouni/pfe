/**
 * Audio Validation Status Component
 * Displays real-time audio validation statistics for debugging and monitoring
 */

import React, { useEffect, useState } from 'react';
import { useLiveListening } from '../hooks/useLiveListening';

interface AudioValidationStatusProps {
  className?: string;
  showDetails?: boolean;
}

export const AudioValidationStatus: React.FC<AudioValidationStatusProps> = ({
  className = '',
  showDetails = false
}) => {
  const { getAudioStats, isInitialized, vadState } = useLiveListening();
  const [stats, setStats] = useState(getAudioStats());

  // Update stats every second
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getAudioStats());
    }, 1000);

    return () => clearInterval(interval);
  }, [getAudioStats]);

  if (!isInitialized) {
    return (
      <div className={`audio-status-inactive ${className}`}>
        <span className="text-gray-500">🎤 Audio validation inactive</span>
      </div>
    );
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'poor': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return '✅';
      case 'good': return '🟢';
      case 'poor': return '⚠️';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className={`audio-validation-status ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={getHealthColor(stats.healthStatus)}>
          {getHealthIcon(stats.healthStatus)}
        </span>
        <span className="font-medium">
          Audio Health: {stats.healthStatus}
        </span>
        <span className="text-sm text-gray-500">
          ({vadState})
        </span>
      </div>

      {showDetails && (
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Segments Processed:</span>
            <span className="font-mono">{stats.segmentsProcessed}</span>
          </div>
          <div className="flex justify-between">
            <span>Segments Corrupted:</span>
            <span className="font-mono text-red-600">{stats.segmentsCorrupted}</span>
          </div>
          <div className="flex justify-between">
            <span>Corruption Rate:</span>
            <span className={`font-mono ${getHealthColor(stats.healthStatus)}`}>
              {(stats.corruptionRate * 100).toFixed(1)}%
            </span>
          </div>
          {stats.lastValidationError && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
              <strong>Last Error:</strong>
              <div className="mt-1 text-red-700">{stats.lastValidationError}</div>
            </div>
          )}
        </div>
      )}

      {stats.corruptionRate > 0.3 && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <strong>⚠️ High corruption rate detected</strong>
          <div className="mt-1 text-yellow-700">
            Consider checking microphone connection or reducing background noise
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioValidationStatus;
