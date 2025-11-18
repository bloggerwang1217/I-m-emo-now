import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Typography, Spacing, BorderRadius, ButtonStyles } from '@/constants/theme';
import { getSettings, updateSettings } from '@/utils/database';
import {
  scheduleDailyNotifications,
  cancelAllNotifications,
  sendTestNotification,
  getScheduledNotifications,
} from '@/utils/notifications';

export default function SettingsScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Time picker states
  const [showTimePicker, setShowTimePicker] = useState<number | null>(null);
  const [time1, setTime1] = useState(new Date());
  const [time2, setTime2] = useState(new Date());
  const [time3, setTime3] = useState(new Date());

  const loadSettings = useCallback(async () => {
    try {
      const data = await getSettings();
      if (data) {
        setNotificationsEnabled(data.notifications_enabled === 1);

        // Parse time strings and create Date objects
        setTime1(parseTimeString(data.notification_time_1));
        setTime2(parseTimeString(data.notification_time_2));
        setTime3(parseTimeString(data.notification_time_3));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const parseTimeString = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
  };

  const formatTimeString = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);

    try {
      await updateSettings({
        notifications_enabled: value ? 1 : 0,
      });

      if (value) {
        // Re-schedule notifications
        await scheduleDailyNotifications(
          formatTimeString(time1),
          formatTimeString(time2),
          formatTimeString(time3)
        );
        Alert.alert('Notifications Enabled', 'You will receive 3 daily reminders.');
      } else {
        // Cancel all notifications
        await cancelAllNotifications();
        Alert.alert('Notifications Disabled', 'All reminders have been cancelled.');
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings.');
      setNotificationsEnabled(!value); // Revert on error
    }
  };

  const handleTimeChange = (event: any, selectedDate: Date | undefined, slotNumber: number) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(null);
    }

    if (selectedDate) {
      switch (slotNumber) {
        case 1:
          setTime1(selectedDate);
          break;
        case 2:
          setTime2(selectedDate);
          break;
        case 3:
          setTime3(selectedDate);
          break;
      }
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);

      const time1Str = formatTimeString(time1);
      const time2Str = formatTimeString(time2);
      const time3Str = formatTimeString(time3);

      await updateSettings({
        notification_time_1: time1Str,
        notification_time_2: time2Str,
        notification_time_3: time3Str,
      });

      // Re-schedule notifications if enabled
      if (notificationsEnabled) {
        await scheduleDailyNotifications(time1Str, time2Str, time3Str);
      }

      Alert.alert('Settings Saved', 'Your notification times have been updated.');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert('Test Sent', 'Check your notifications!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification.');
    }
  };

  const handleViewScheduled = async () => {
    try {
      const scheduled = await getScheduledNotifications();
      const count = scheduled.length;
      Alert.alert(
        'Scheduled Notifications',
        `You have ${count} notification${count !== 1 ? 's' : ''} scheduled.`
      );
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.interactive.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your notification preferences</Text>
      </View>

      {/* Notifications Toggle */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="notifications-outline" size={24} color={Colors.text.primary} />
          <Text style={styles.sectionTitle}>Daily Notifications</Text>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Enable Reminders</Text>
            <Text style={styles.settingDescription}>
              Receive 3 daily notifications for check-ins
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{
              false: Colors.border.default,
              true: Colors.interactive.primary,
            }}
            thumbColor={Colors.text.primary}
          />
        </View>
      </View>

      {/* Notification Times */}
      {notificationsEnabled && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={24} color={Colors.text.primary} />
            <Text style={styles.sectionTitle}>Notification Times</Text>
          </View>

          {/* Time Slot 1 */}
          <TouchableOpacity
            style={styles.timeRow}
            onPress={() => setShowTimePicker(1)}>
            <Text style={styles.timeLabel}>First Check-In</Text>
            <View style={styles.timeValue}>
              <Text style={styles.timeText}>{formatTimeString(time1)}</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
            </View>
          </TouchableOpacity>

          {/* Time Slot 2 */}
          <TouchableOpacity
            style={styles.timeRow}
            onPress={() => setShowTimePicker(2)}>
            <Text style={styles.timeLabel}>Second Check-In</Text>
            <View style={styles.timeValue}>
              <Text style={styles.timeText}>{formatTimeString(time2)}</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
            </View>
          </TouchableOpacity>

          {/* Time Slot 3 */}
          <TouchableOpacity
            style={styles.timeRow}
            onPress={() => setShowTimePicker(3)}>
            <Text style={styles.timeLabel}>Third Check-In</Text>
            <View style={styles.timeValue}>
              <Text style={styles.timeText}>{formatTimeString(time3)}</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
            </View>
          </TouchableOpacity>

          {/* Time Pickers */}
          {showTimePicker === 1 && (
            <DateTimePicker
              value={time1}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => handleTimeChange(event, date, 1)}
            />
          )}
          {showTimePicker === 2 && (
            <DateTimePicker
              value={time2}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => handleTimeChange(event, date, 2)}
            />
          )}
          {showTimePicker === 3 && (
            <DateTimePicker
              value={time3}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => handleTimeChange(event, date, 3)}
            />
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSaveSettings}
            disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator color={Colors.text.inverse} size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Times</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Testing Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flask-outline" size={24} color={Colors.text.primary} />
          <Text style={styles.sectionTitle}>Testing</Text>
        </View>

        <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
          <Ionicons name="paper-plane-outline" size={20} color={Colors.text.primary} />
          <Text style={styles.testButtonText}>Send Test Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={handleViewScheduled}>
          <Ionicons name="list-outline" size={20} color={Colors.text.primary} />
          <Text style={styles.testButtonText}>View Scheduled Notifications</Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.text.secondary} />
        <Text style={styles.infoText}>
          Notification times will trigger daily reminders for you to complete your emotional
          check-ins. Make sure to allow notifications in your device settings.
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
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
  section: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.primary,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.primary,
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.primary,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.divider,
  },
  timeLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.primary,
  },
  timeValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timeText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.interactive.primary,
    fontFamily: Typography.fontFamily.primary,
  },
  saveButton: {
    backgroundColor: ButtonStyles.primary.backgroundColor,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
    fontFamily: Typography.fontFamily.primary,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  testButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.primary,
  },
  infoSection: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.sm,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.primary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
});
