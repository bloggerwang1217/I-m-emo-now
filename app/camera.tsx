import { Ionicons } from '@expo/vector-icons';
import {
  CameraType,
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

export default function CameraScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionId?: string; currentEmotionScore?: string }>();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('front');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    // Request permissions on mount
    const requestPermissions = async () => {
      if (!cameraPermission?.granted) {
        await requestCameraPermission();
      }
      if (!microphonePermission?.granted) {
        await requestMicrophonePermission();
      }
      if (!mediaPermission?.granted) {
        await requestMediaPermission();
      }
    };

    requestPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const camera = cameraRef.current;
    return () => {
      if (camera && isRecording) {
        camera.stopRecording();
      }
    };
  }, [isRecording]);

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    try {
      setIsRecording(true);
      setCountdown(3);

      // Countdown 3, 2, 1
      await new Promise((resolve) => {
        let count = 3;
        intervalId = setInterval(() => {
          count--;
          setCountdown(count);
          if (count === 0) {
            if (intervalId) clearInterval(intervalId);
            intervalId = null;
            resolve(true);
          }
        }, 1000);
      });

      setCountdown(null);

      // Wait a moment for the camera to be ready (Android needs time to initialize)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Start recording - recordAsync will resolve when stopRecording is called
      console.log('Starting recordAsync...');
      const video = await cameraRef.current.recordAsync();

      // Handle the recorded video after stopRecording is called
      console.log('Video result:', JSON.stringify(video, null, 2));

      if (video && video.uri) {
        console.log('Video URI found:', video.uri);
        try {
          // Save to media library
          const asset = await MediaLibrary.createAssetAsync(video.uri);
          console.log('Saved to media library:', asset);

          // Navigate back with parameters (preserve emotionScore)
          // Pass the full URI from media library for upload
          router.navigate({
            pathname: '/(drawer)',
            params: {
              videoRecorded: asset.uri,
              sessionId: params.sessionId,
              emotionScore: params.currentEmotionScore,
            },
          });
        } catch (libraryError) {
          console.error('Error saving to media library:', libraryError);
          // Still navigate back even if media library save fails, use original URI
          router.navigate({
            pathname: '/(drawer)',
            params: {
              videoRecorded: video.uri,
              sessionId: params.sessionId,
              emotionScore: params.currentEmotionScore,
            },
          });
        }
      } else {
        // Video is null/undefined - treat as successful cancellation
        console.warn('Video recording returned no URI:', video);
        Alert.alert('Recording Cancelled', 'Video recording was cancelled or too short.');
        router.back();
      }
    } catch (error) {
      console.error('Error recording video:', error);
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorName = error instanceof Error ? error.name : 'Unknown';

      Alert.alert(
        'Recording Error',
        `Failed to record video.\n\nError: ${errorName}\nMessage: ${errorMessage}\n\nPlease try again.`
      );
    } finally {
      // Cleanup interval if still running
      if (intervalId) {
        clearInterval(intervalId);
      }
      setIsRecording(false);
      setCountdown(null);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      // This will cause recordAsync to resolve with the video object
      cameraRef.current.stopRecording();
    }
  };

  const handleCancel = useCallback(() => {
    if (isRecording && cameraRef.current) {
      // Stop recording before leaving
      cameraRef.current.stopRecording();
    }
    router.back();
  }, [isRecording, router]);

  if (!cameraPermission || !microphonePermission || !mediaPermission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.interactive.primary} />
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={Colors.text.secondary} />
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!microphonePermission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="mic-outline" size={64} color={Colors.text.secondary} />
        <Text style={styles.permissionText}>Microphone permission is required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestMicrophonePermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!mediaPermission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="images-outline" size={64} color={Colors.text.secondary} />
        <Text style={styles.permissionText}>Media library permission is required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestMediaPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode="video"
        videoQuality="720p"
      />

      {/* Countdown overlay */}
      {countdown !== null && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}

      {/* Recording indicator */}
      {isRecording && countdown === null && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>RECORDING</Text>
        </View>
      )}

      {/* Controls overlay */}
      <View style={styles.controlsContainer}>
        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraFacing}
            disabled={isRecording}>
            <Ionicons name="camera-reverse-outline" size={32} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomControls}>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {countdown !== null
                ? 'Please get ready!'
                : isRecording
                  ? 'Tap red button to stop'
                  : 'Tap to start recording'}
            </Text>
          </View>

          {countdown === null && (
            <>
              <TouchableOpacity
                style={[styles.recordButton, isRecording && styles.recordButtonActive]}
                onPress={isRecording ? stopRecording : startRecording}>
                <View style={styles.recordButtonInner} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  permissionText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.primary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  permissionButton: {
    backgroundColor: Colors.interactive.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.sm,
  },
  permissionButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
    fontFamily: Typography.fontFamily.primary,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: Spacing.sm,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.status.error,
    marginRight: Spacing.sm,
  },
  recordingText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.primary,
  },
  controlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    flexDirection: 'column',
    pointerEvents: 'box-none',
    zIndex: 10,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: Spacing.lg,
    marginTop: 40,
    pointerEvents: 'auto',
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: Spacing.md,
    borderRadius: 25,
  },
  bottomControls: {
    alignItems: 'center',
    paddingBottom: Spacing['2xl'],
    gap: Spacing.lg,
    pointerEvents: 'auto',
  },
  infoBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  infoText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.primary,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.interactive.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.text.primary,
  },
  recordButtonActive: {
    backgroundColor: Colors.status.error,
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.text.primary,
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  cancelButtonText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.primary,
  },
});
