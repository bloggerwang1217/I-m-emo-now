/**
 * Notification utility for I'm Emo Now app
 * Handles notification scheduling and permissions
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    // For Android, set up notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D79921', // Muted Gold from our color palette
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Parse time string (HH:mm) to hour and minute
 */
const parseTimeString = (timeString: string): { hour: number; minute: number } => {
  const [hourStr, minuteStr] = timeString.split(':');
  return {
    hour: parseInt(hourStr, 10),
    minute: parseInt(minuteStr, 10),
  };
};

/**
 * Schedule daily notifications at specified times
 */
export const scheduleDailyNotifications = async (
  time1: string,
  time2: string,
  time3: string
): Promise<void> => {
  try {
    // Cancel all existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    const times = [time1, time2, time3];
    const notificationIds: string[] = [];

    for (let i = 0; i < times.length; i++) {
      const { hour, minute } = parseTimeString(times[i]);

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time for your check-in 🌟",
          body: "How are you feeling right now? Share your emotion with a quick vlog.",
          data: { type: 'daily-check-in', sequence: i + 1 },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });

      notificationIds.push(id);
      console.log(`Scheduled notification ${i + 1} at ${times[i]}, ID: ${id}`);
    }

    console.log('All notifications scheduled successfully');
  } catch (error) {
    console.error('Error scheduling notifications:', error);
    throw error;
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
    throw error;
  }
};

/**
 * Get all scheduled notifications
 */
export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

/**
 * Send an immediate test notification
 */
export const sendTestNotification = async (): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification 🧪",
        body: "Your notifications are working correctly!",
        data: { type: 'test' },
        sound: true,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw error;
  }
};

/**
 * Set up notification response handler
 * Call this in your app's main component
 */
export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

/**
 * Set up notification received listener (when app is in foreground)
 * Call this in your app's main component
 */
export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription => {
  return Notifications.addNotificationReceivedListener(callback);
};
