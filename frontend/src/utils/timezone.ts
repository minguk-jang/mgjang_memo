/**
 * Detect user's timezone from browser
 */
export function detectUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn('Failed to detect timezone, defaulting to UTC', error);
    return 'UTC';
  }
}

/**
 * Format time in user's timezone
 */
export function formatTimeInTimezone(date: Date, timezone: string): string {
  try {
    return date.toLocaleString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.warn(`Invalid timezone: ${timezone}`, error);
    return date.toLocaleTimeString('en-US', { hour12: false });
  }
}

/**
 * Display formatted time for alarm
 */
export function getTimeDisplay(isoString: string, timezone: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.warn(`Failed to format time: ${isoString}`, error);
    return isoString;
  }
}
