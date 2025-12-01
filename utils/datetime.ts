/**
 * Datetime utility for handling local timezone timestamps
 * Provides functions to get local time in ISO format
 */

/**
 * Get current local datetime in ISO format with timezone offset
 * Returns ISO string that represents the local time (not UTC)
 *
 * Example: "2024-12-01T15:30:45+08:00" (Taiwan Standard Time)
 */
export const getLocalISOString = (): string => {
  const now = new Date();

  // Get timezone offset in minutes
  const tzOffsetMinutes = -now.getTimezoneOffset();
  const tzOffsetHours = Math.floor(Math.abs(tzOffsetMinutes) / 60);
  const tzOffsetMins = Math.abs(tzOffsetMinutes) % 60;

  // Format timezone offset
  const tzSign = tzOffsetMinutes >= 0 ? '+' : '-';
  const tzOffset = `${tzSign}${String(tzOffsetHours).padStart(2, '0')}:${String(tzOffsetMins).padStart(2, '0')}`;

  // Get local time components
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${tzOffset}`;
};

/**
 * Get current local datetime in simple ISO format without timezone
 * This format is more compatible with SQLite default DATETIME
 *
 * Example: "2024-12-01 15:30:45"
 */
export const getLocalDatetimeString = (): string => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Get current timezone info
 * Returns timezone name and UTC offset
 */
export const getTimezoneInfo = (): { name: string; offset: string; offsetMinutes: number } => {
  const now = new Date();
  const tzOffsetMinutes = -now.getTimezoneOffset();

  // Get timezone name (works on most platforms)
  const tzName = new Intl.DateTimeFormat('en-US', { timeZoneName: 'long' })
    .formatToParts(now)
    .find(part => part.type === 'timeZoneName')?.value || 'Unknown';

  // Format offset
  const tzOffsetHours = Math.floor(Math.abs(tzOffsetMinutes) / 60);
  const tzOffsetMins = Math.abs(tzOffsetMinutes) % 60;
  const tzSign = tzOffsetMinutes >= 0 ? '+' : '-';
  const tzOffset = `${tzSign}${String(tzOffsetHours).padStart(2, '0')}:${String(tzOffsetMins).padStart(2, '0')}`;

  return {
    name: tzName,
    offset: tzOffset,
    offsetMinutes: tzOffsetMinutes,
  };
};
