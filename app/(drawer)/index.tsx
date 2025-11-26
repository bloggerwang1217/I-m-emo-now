import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Typography, Spacing, ButtonStyles, BorderRadius } from '@/constants/theme';
import { insertSession } from '@/utils/database';
import { getCurrentLocation } from '@/utils/location';

// Emotion emojis for the 1-5 scale
const EMOTION_EMOJIS = ['😢', '😟', '😐', '😊', '😄'];
const EMOTION_LABELS = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];

export default function HomeScreen() {
  const router = useRouter();
  const [emotionScore, setEmotionScore] = useState<number>(3); // Default to neutral
  const [videoFilename, setVideoFilename] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmotionChange = (value: number) => {
    setEmotionScore(Math.round(value));
  };

  const handleRecordVideo = () => {
    router.push('/camera');
  };

  const handleSubmit = async () => {
    if (!videoFilename) {
      Alert.alert('No Video Recorded', 'Please record a video before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Get current location
      const location = await getCurrentLocation();

      // Create session data
      const sessionData = {
        timestamp: new Date().toISOString(),
        emotion_score: emotionScore,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        video_filename: videoFilename,
      };

      // Insert into database
      await insertSession(sessionData);

      // Show success message
      Alert.alert(
        'Check-In Complete',
        'Your emotional data has been recorded successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setEmotionScore(3);
              setVideoFilename(null);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting check-in:', error);
      Alert.alert('Error', 'Failed to save your check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>How are you feeling?</Text>
        <Text style={styles.subtitle}>Share your emotional state right now</Text>
      </View>

      {/* Emotion Slider Section */}
      <View style={styles.emotionSection}>
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
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting || !videoFilename}>
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
