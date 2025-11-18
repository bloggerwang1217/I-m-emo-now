/**
 * Location utility for I'm Emo Now app
 * Handles GPS coordinate capture during check-ins only
 */

import * as Location from 'expo-location';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

/**
 * Request location permissions
 */
export const requestLocationPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.log('Location permission not granted');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return false;
  }
};

/**
 * Get current location coordinates
 * Only called during check-in submission (no background tracking)
 */
export const getCurrentLocation = async (): Promise<LocationCoords | null> => {
  try {
    // Check if we have permission
    const { status } = await Location.getForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.log('Location permission not granted');
      return null;
    }

    // Get current position with timeout and accuracy settings
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced, // Balance between accuracy and battery
      timeInterval: 5000, // 5 second timeout
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

/**
 * Check if location services are enabled
 */
export const isLocationEnabled = async (): Promise<boolean> => {
  try {
    return await Location.hasServicesEnabledAsync();
  } catch (error) {
    console.error('Error checking location services:', error);
    return false;
  }
};

/**
 * Get location permission status
 */
export const getLocationPermissionStatus = async (): Promise<Location.PermissionStatus> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status;
  } catch (error) {
    console.error('Error getting location permission status:', error);
    return Location.PermissionStatus.UNDETERMINED;
  }
};
