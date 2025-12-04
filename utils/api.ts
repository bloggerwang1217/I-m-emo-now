import { getDeviceId } from './device';

// API configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  SESSIONS: `${API_BASE_URL}/sessions`,
  SESSION_VIDEO: (sessionId: string) => `${API_BASE_URL}/sessions/${sessionId}/video`,
};

interface SessionPayload {
  session_id: string;
  device_id: string;
  timestamp: string;
  emotion_score: number;
  latitude: number | null;
  longitude: number | null;
}

interface UploadResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Upload session metadata (emotion score, location, timestamp)
 * @param sessionId - Unique session identifier (generated on frontend)
 * @param timestamp - ISO 8601 timestamp with timezone
 * @param emotionScore - Emotion rating from 1-5
 * @param latitude - GPS latitude coordinate
 * @param longitude - GPS longitude coordinate
 */
export async function uploadSessionMetadata(
  sessionId: string,
  timestamp: string,
  emotionScore: number,
  latitude: number | null,
  longitude: number | null
): Promise<UploadResponse> {
  try {
    const deviceId = await getDeviceId();

    if (!deviceId) {
      throw new Error('Device ID not found');
    }

    const payload: SessionPayload = {
      session_id: sessionId,
      device_id: deviceId,
      timestamp,
      emotion_score: emotionScore,
      latitude,
      longitude,
    };

    const response = await fetch(API_ENDPOINTS.SESSIONS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorData.detail || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Session metadata uploaded successfully:', data);

    return {
      success: true,
      data,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error uploading session metadata:', errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Upload video file to the server
 * The video file URI should be from the device's file system
 */
export async function uploadVideoFile(
  sessionId: string,
  videoUri: string
): Promise<UploadResponse> {
  try {
    // Create FormData for multipart/form-data upload
    const formData = new FormData();

    // Append video file
    const videoFile = {
      uri: videoUri,
      type: 'video/mp4',
      name: `video_${sessionId}.mp4`,
    };

    formData.append('video', videoFile as any);

    const response = await fetch(API_ENDPOINTS.SESSION_VIDEO(sessionId), {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type header for FormData - fetch will set it automatically
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorData.detail || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Video file uploaded successfully:', data);

    return {
      success: true,
      data,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error uploading video file:', errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Test API connection
 * Useful for debugging connectivity issues
 */
export async function testAPIConnection(): Promise<boolean> {
  try {
    const deviceId = await getDeviceId();

    if (!deviceId) {
      console.warn('Device ID not available for connection test');
      return false;
    }

    const response = await fetch(API_ENDPOINTS.SESSIONS, {
      method: 'GET',
      headers: {
        'X-Device-ID': deviceId,
      },
    });

    const isConnected = response.ok || response.status === 401 || response.status === 403;
    console.log('API connection test result:', isConnected);

    return isConnected;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
}
