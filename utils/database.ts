/**
 * Database utility for I'm Emo Now app
 * Handles SQLite database initialization and operations
 */

import * as SQLite from 'expo-sqlite';

const DB_NAME = 'imo_emo_now.db';

export interface Session {
  id?: number;
  timestamp: string;
  emotion_score: number;
  latitude: number | null;
  longitude: number | null;
  video_filename: string | null;
}

export interface Settings {
  id: number;
  notification_time_1: string;
  notification_time_2: string;
  notification_time_3: string;
  notifications_enabled: number;
}

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize database connection and create tables if they don't exist
 */
export const initDatabase = async (): Promise<void> => {
  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);

    // Create sessions table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        emotion_score INTEGER NOT NULL,
        latitude REAL,
        longitude REAL,
        video_filename TEXT
      );
    `);

    // Create settings table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY,
        notification_time_1 TEXT DEFAULT '09:00',
        notification_time_2 TEXT DEFAULT '14:00',
        notification_time_3 TEXT DEFAULT '20:00',
        notifications_enabled INTEGER DEFAULT 1
      );
    `);

    // Initialize default settings if not exists
    const settingsCount = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM settings'
    );

    if (settingsCount && settingsCount.count === 0) {
      await db.runAsync(
        'INSERT INTO settings (id, notification_time_1, notification_time_2, notification_time_3, notifications_enabled) VALUES (1, ?, ?, ?, ?)',
        ['09:00', '14:00', '20:00', 1]
      );
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

/**
 * Get database instance
 */
export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

/**
 * Insert a new session record
 */
export const insertSession = async (session: Omit<Session, 'id'>): Promise<number> => {
  try {
    const database = getDatabase();
    const result = await database.runAsync(
      'INSERT INTO sessions (timestamp, emotion_score, latitude, longitude, video_filename) VALUES (?, ?, ?, ?, ?)',
      [session.timestamp, session.emotion_score, session.latitude, session.longitude, session.video_filename]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error inserting session:', error);
    throw error;
  }
};

/**
 * Get all sessions ordered by timestamp descending
 */
export const getAllSessions = async (): Promise<Session[]> => {
  try {
    const database = getDatabase();
    const sessions = await database.getAllAsync<Session>(
      'SELECT * FROM sessions ORDER BY timestamp DESC'
    );
    return sessions;
  } catch (error) {
    console.error('Error getting all sessions:', error);
    throw error;
  }
};

/**
 * Get sessions within a date range
 */
export const getSessionsByDateRange = async (startDate: string, endDate: string): Promise<Session[]> => {
  try {
    const database = getDatabase();
    const sessions = await database.getAllAsync<Session>(
      'SELECT * FROM sessions WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC',
      [startDate, endDate]
    );
    return sessions;
  } catch (error) {
    console.error('Error getting sessions by date range:', error);
    throw error;
  }
};

/**
 * Delete a session by ID
 */
export const deleteSession = async (id: number): Promise<void> => {
  try {
    const database = getDatabase();
    await database.runAsync('DELETE FROM sessions WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};

/**
 * Get settings
 */
export const getSettings = async (): Promise<Settings | null> => {
  try {
    const database = getDatabase();
    const settings = await database.getFirstAsync<Settings>(
      'SELECT * FROM settings WHERE id = 1'
    );
    return settings || null;
  } catch (error) {
    console.error('Error getting settings:', error);
    throw error;
  }
};

/**
 * Update settings
 */
export const updateSettings = async (settings: Partial<Omit<Settings, 'id'>>): Promise<void> => {
  try {
    const database = getDatabase();
    const updates: string[] = [];
    const values: any[] = [];

    if (settings.notification_time_1 !== undefined) {
      updates.push('notification_time_1 = ?');
      values.push(settings.notification_time_1);
    }
    if (settings.notification_time_2 !== undefined) {
      updates.push('notification_time_2 = ?');
      values.push(settings.notification_time_2);
    }
    if (settings.notification_time_3 !== undefined) {
      updates.push('notification_time_3 = ?');
      values.push(settings.notification_time_3);
    }
    if (settings.notifications_enabled !== undefined) {
      updates.push('notifications_enabled = ?');
      values.push(settings.notifications_enabled);
    }

    if (updates.length > 0) {
      await database.runAsync(
        `UPDATE settings SET ${updates.join(', ')} WHERE id = 1`,
        values
      );
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

/**
 * Get total count of sessions
 */
export const getSessionCount = async (): Promise<number> => {
  try {
    const database = getDatabase();
    const result = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM sessions'
    );
    return result?.count || 0;
  } catch (error) {
    console.error('Error getting session count:', error);
    throw error;
  }
};

/**
 * Export all sessions as CSV format
 */
export const exportSessionsToCSV = async (): Promise<string> => {
  try {
    const sessions = await getAllSessions();

    // CSV header
    let csv = 'timestamp,gps_x,gps_y,emo_score\n';

    // CSV rows
    sessions.forEach(session => {
      const lat = session.latitude !== null ? session.latitude : '';
      const lng = session.longitude !== null ? session.longitude : '';
      csv += `${session.timestamp},${lat},${lng},${session.emotion_score}\n`;
    });

    return csv;
  } catch (error) {
    console.error('Error exporting sessions to CSV:', error);
    throw error;
  }
};

/**
 * Clear all sessions (for testing/reset)
 */
export const clearAllSessions = async (): Promise<void> => {
  try {
    const database = getDatabase();
    await database.runAsync('DELETE FROM sessions');
  } catch (error) {
    console.error('Error clearing all sessions:', error);
    throw error;
  }
};
