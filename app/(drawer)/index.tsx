import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';

import StarsBackground from '@/components/stars-background';
import { BorderRadius, ButtonStyles, Colors, Spacing, Typography } from '@/constants/theme';
import { insertSession } from '@/utils/database';
import { getCurrentLocation, requestLocationPermissions } from '@/utils/location';
import { getLocalISOString } from '@/utils/datetime';
import { getOrCreateDeviceId } from '@/utils/device';
import { uploadQueue } from '@/utils/uploadQueue';

// Emotion emojis for the 1-5 scale
const EMOTION_EMOJIS = ['😢', '😟', '😐', '😊', '😄'];
const EMOTION_LABELS = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ videoRecorded?: string; emotionScore?: string }>();
  const [emotionScore, setEmotionScore] = useState<number>(3); // Default to neutral
  const [videoFilename, setVideoFilename] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Request location permissions on mount
  useEffect(() => {
    const requestPermissions = async () => {
      await requestLocationPermissions();
    };
    requestPermissions();
  }, []);

  // Handle video recorded parameter from camera screen
  useEffect(() => {
    if (params.videoRecorded) {
      setVideoFilename(params.videoRecorded);
      // Restore emotionScore if provided
      if (params.emotionScore) {
        setEmotionScore(parseInt(params.emotionScore, 10));
      }
      // Clear the parameters to avoid re-triggering
      router.setParams({ videoRecorded: undefined, emotionScore: undefined });
    }
  }, [params.videoRecorded, params.emotionScore, router]);

  const handleEmotionChange = (value: number) => {
    setEmotionScore(Math.round(value));
  };

  const handleRecordVideo = () => {
    // Generate session ID before recording (will be used for video filename)
    const sessionId = uuidv4();
    router.push({
      pathname: '/camera',
      params: { currentEmotionScore: emotionScore.toString(), sessionId },
    });
  };

  // Get emotion card styles based on emotion score
  const getEmotionCardStyle = () => {
    const emotionScoreIndex = emotionScore - 1; // 0-4 index
    const emotionKeys = ['veryNegative', 'negative', 'neutral', 'positive', 'veryPositive'] as const;
    const key = emotionKeys[emotionScoreIndex];

    return {
      backgroundColor: Colors.emotionBackground[key],
      shadowColor: Colors.emotionGlow[key],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 12,
      elevation: 8,
    };
  };

  const handleSubmit = async () => {
    if (!videoFilename) {
      Alert.alert('No Video Recorded', 'Please record a video before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Get device ID (creates one if not exists)
      await getOrCreateDeviceId();

      // Get current location (permission already requested on mount)
      const location = await getCurrentLocation();

      // Extract session ID from videoFilename (format: ${sessionId}.mp4)
      const sessionId = videoFilename.replace('.mp4', '');
      const timestamp = getLocalISOString();
      const queueId = uuidv4();

      // Create session data for local database
      const sessionData = {
        timestamp,
        emotion_score: emotionScore,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        video_filename: videoFilename, // Store video URI from media library
      };

      // Create upload queue item
      const uploadQueueItem = {
        id: queueId,
        session_id: sessionId,
        timestamp,
        emotion_score: emotionScore,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        video_uri: videoFilename, // Use video URI from media library
      };

      // Insert into local database
      await insertSession(sessionData);

      // Add to upload queue (handles all persistence and processing)
      await uploadQueue.addToQueue(uploadQueueItem);

      // Show success message with better feedback
      const locationStatus = location ? 'with location' : 'without location';
      const uploadStatusNote =
        'Will be uploaded to cloud when network is available.\n';
      Alert.alert(
        'Check-In Complete! ✓',
        `Your emotional check-in has been saved ${locationStatus}.\n${uploadStatusNote}\nEmotion: ${
          EMOTION_LABELS[emotionScore - 1]
        }\nVideo: Saved to camera roll`,
        [
          {
            text: 'View History',
            onPress: () => {
              // Reset form and navigate to history
              setEmotionScore(3);
              setVideoFilename(null);
              router.push('/(drawer)/history');
            },
          },
          {
            text: 'Done',
            style: 'cancel',
            onPress: () => {
              // Reset form
              setEmotionScore(3);
              setVideoFilename(null);
            },
          },
        ],
        {
          cancelable: true,
          onDismiss: () => {
            // Reset form when dismissed (Android back button or tap outside)
            setEmotionScore(3);
            setVideoFilename(null);
          },
        }
      );
    } catch (error) {
      console.error('Error submitting check-in:', error);

      let errorMessage = 'Failed to save your check-in. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('database')) {
          errorMessage = 'Database error. Please restart the app and try again.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Location permission denied. Check-in saved without location.';
        }
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StarsBackground />
      <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>How are you feeling?</Text>
        <Text style={styles.subtitle}>Share your emotional state right now</Text>
      </View>

      {/* Emotion Slider Section */}
      <View style={[styles.emotionSection, getEmotionCardStyle()]}>
        <View style={styles.emojiDisplay}>
          <Text style={styles.emojiLarge}>{EMOTION_EMOJIS[emotionScore - 1]}</Text>
          <Text style={styles.emotionLabel}>{EMOTION_LABELS[emotionScore - 1]}</Text>
        </View>

        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={emotionScore}
            onValueChange={handleEmotionChange}
            minimumTrackTintColor={Colors.interactive.primary}
            maximumTrackTintColor={Colors.border.default}
            thumbTintColor={Colors.interactive.primary}
          />

          {/* Emoji markers below slider */}
          <View style={styles.emojiMarkers}>
            {EMOTION_EMOJIS.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleEmotionChange(index + 1)}
                style={[
                  styles.emojiMarkerButton,
                  emotionScore === index + 1 && styles.emojiMarkerButtonActive,
                ]}>
                <Text
                  style={[
                    styles.emojiMarker,
                    emotionScore === index + 1 && styles.emojiMarkerActive,
                  ]}>
                  {emoji}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Video Section */}
      <View style={styles.videoSection}>
        <Text style={styles.sectionTitle}>1-Second Vlog</Text>
        <Text style={styles.sectionDescription}>
          Record a quick video to capture this moment
        </Text>

        <TouchableOpacity style={styles.videoButton} onPress={handleRecordVideo}>
          <Ionicons name="videocam-outline" size={24} color={Colors.text.primary} />
          <Text style={styles.videoButtonText}>
            {videoFilename ? 'Video Recorded ✓' : 'Record Video'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (isSubmitting || !videoFilename) && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator color={Colors.text.inverse} />
        ) : (
          <Text style={styles.submitButtonText}>Submit Check-In</Text>
        )}
      </TouchableOpacity>

      {/* Location Info */}
      <View style={styles.infoSection}>
        <Ionicons name="location-outline" size={14} color={Colors.text.secondary} />
        <Text style={styles.infoText}>
          Location will be captured when you submit
        </Text>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.primary,
  },
  emotionSection: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  emojiDisplay: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emojiLarge: {
    fontSize: 80,
    marginBottom: Spacing.md,
  },
  emotionLabel: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.primary,
  },
  sliderContainer: {
    width: '100%',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  emojiMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.sm,
  },
  emojiMarkerButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  emojiMarkerButtonActive: {
    // Visual feedback for active state can be added here
  },
  emojiMarker: {
    fontSize: 24,
    opacity: 0.5,
  },
  emojiMarkerActive: {
    opacity: 1,
    transform: [{ scale: 1.2 }],
  },
  videoSection: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.primary,
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.primary,
    marginBottom: Spacing.md,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: BorderRadius.sm,
    borderStyle: 'dashed',
  },
  videoButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.primary,
    marginLeft: Spacing.sm,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
  },
  infoText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.primary,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  submitButton: {
    backgroundColor: ButtonStyles.primary.backgroundColor,
    paddingVertical: ButtonStyles.primary.paddingVertical,
    paddingHorizontal: ButtonStyles.primary.paddingHorizontal,
    borderRadius: ButtonStyles.primary.borderRadius,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
    fontFamily: Typography.fontFamily.primary,
  },
  noteText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.primary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: Spacing.lg,
  },
});
