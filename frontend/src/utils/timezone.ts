/**
 * Timezone detection and handling utilities.
 */

/**
 * Detect user's timezone from browser.
 */
export function detectUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Convert UTC datetime to user's local timezone for display.
 */
export function formatTimeInUserTz(
  utcDatetime: Date | string,
  timezone: string
): string {
  const date = typeof utcDatetime === "string" ? new Date(utcDatetime) : utcDatetime;

  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

/**
 * Get time in HH:MM format for display.
 */
export function getTimeDisplay(utcDatetime: Date | string, timezone: string): string {
  const date = typeof utcDatetime === "string" ? new Date(utcDatetime) : utcDatetime;

  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  } catch {
    return date.toISOString().substring(11, 16);
  }
}
