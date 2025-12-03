import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'emo_now_device_id';

/**
 * Get or create a unique device ID
 * On first run, generates a UUID and stores it in AsyncStorage
 * On subsequent runs, retrieves the stored UUID
 */
export async function getOrCreateDeviceId(): Promise<string> {
  try {
    // Try to retrieve existing device ID
    const existingId = await AsyncStorage.getItem(DEVICE_ID_KEY);

    if (existingId) {
      return existingId;
    }

    // Generate new device ID if not found
    const newDeviceId = uuidv4();
    await AsyncStorage.setItem(DEVICE_ID_KEY, newDeviceId);

    console.log('Created new device ID:', newDeviceId);
    return newDeviceId;
  } catch (error) {
    console.error('Error managing device ID:', error);
    // Fallback: generate a temporary UUID if storage fails
    return uuidv4();
  }
}

/**
 * Get the current device ID
 * Returns null if device ID has not been created yet
 */
export async function getDeviceId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(DEVICE_ID_KEY);
  } catch (error) {
    console.error('Error retrieving device ID:', error);
    return null;
  }
}

/**
 * Clear the stored device ID (for testing or reset purposes)
 */
export async function clearDeviceId(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DEVICE_ID_KEY);
    console.log('Device ID cleared');
  } catch (error) {
    console.error('Error clearing device ID:', error);
  }
}
