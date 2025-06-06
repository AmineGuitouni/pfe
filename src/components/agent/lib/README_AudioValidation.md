# Audio Corruption Detection

This module provides comprehensive audio validation and corruption detection for the live listening feature.

## Features

### 1. Quick Validation (`quickValidateAudio`)
- **Purpose**: Fast validation for live audio processing
- **Performance**: Optimized for real-time use
- **Checks**:
  - Basic format validation
  - Data URI structure
  - Minimum size requirements
  - Base64 encoding validity

### 2. Comprehensive Validation (`validateAudioData`)
- **Purpose**: Deep analysis including corruption detection
- **Performance**: More thorough but slower
- **Checks**:
  - All quick validation checks
  - Audio file header validation (WAV, WebM, MP3, MP4)
  - Entropy analysis for corruption detection
  - Suspicious pattern detection
  - Duration estimation and validation

### 3. Buffer-Level Validation
- **Purpose**: Detect corruption at the audio buffer level
- **Features**:
  - Corrupted chunk filtering
  - Size-based validation
  - Health monitoring

## Usage Examples

### Basic Quick Validation
```typescript
import { quickValidateAudio } from './audioUtils';

const result = quickValidateAudio(audioData);
if (!result.isValid) {
  console.error('Audio validation failed:', result.error);
  return;
}
```

### Comprehensive Validation
```typescript
import { validateAudioComprehensively } from './audioUtils';

const result = await validateAudioComprehensively(audioData);
if (!result.isValid) {
  console.error('Errors:', result.errors);
  console.warn('Warnings:', result.warnings);
  
  if (result.shouldRetry) {
    console.log('Corruption detected, should retry recording');
  }
}
```

### Buffer Health Check
```typescript
const bufferHealth = bufferManager.checkBufferHealth();
if (!bufferHealth.isHealthy) {
  console.warn('Buffer issues detected:', bufferHealth.issues);
  console.log('Stats:', bufferHealth.stats);
}
```

## Corruption Detection Features

### Common Corruption Patterns Detected:
1. **Empty or null audio data**
2. **Malformed base64 encoding**
3. **Invalid file headers**
4. **All-zero audio data (silent corruption)**
5. **Repeated byte patterns**
6. **Low entropy data**
7. **Unreasonable file sizes**
8. **Invalid duration estimates**

### Error Handling:
- **Graceful degradation**: Live listening continues even if some segments are corrupted
- **Automatic filtering**: Corrupted audio chunks are filtered out at the buffer level
- **Detailed logging**: Comprehensive error reporting for debugging
- **Retry logic**: Distinguishes between permanent and temporary issues

## Integration with Live Listening

The audio validation is integrated into the live listening pipeline:

1. **Buffer Level**: Corrupted chunks are detected and filtered during audio buffering
2. **Segment Level**: Each audio segment is validated before conversion to base64
3. **API Level**: Final validation before sending to the API
4. **Error Recovery**: Failed validations don't stop the live listening process

## Performance Considerations

- **Quick validation** is used by default for live audio processing
- **Comprehensive validation** can be enabled for debugging or quality assurance
- **Buffer health checks** run periodically to maintain audio quality
- **Automatic cleanup** prevents memory leaks from corrupted data

## Testing

Use the provided test utilities to verify the validation system:

```typescript
import { runAudioValidationTests } from './audioValidationTest';

// Run tests (for development/debugging)
await runAudioValidationTests();
```

## Configuration

The validation system uses sensible defaults but can be customized:

- **Minimum file size**: 100 bytes (configurable)
- **Maximum file size**: 50MB (configurable)
- **Entropy threshold**: 2.0 (configurable)
- **Buffer corruption threshold**: 30% (configurable)
