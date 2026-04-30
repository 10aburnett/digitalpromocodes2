export function normalizeImagePath(path: string | null | undefined): string {
  if (!path) return '/placeholder.png';
  
  // If the path already starts with http:// or https://, return it as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If the path doesn't start with /, add it
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  
  return path;
}

/**
 * Formats a date as a human-readable "time ago" string (e.g., "5 minutes ago", "2 hours ago")
 * @param date The date to format (ISO string or Date object)
 * @returns A human-readable string representing the time elapsed
 */
export function formatTimeAgo(date: Date | string): string {
  let dateObj: Date;
  
  // Handle string dates properly
  if (typeof date === 'string') {
    // Parse ISO string to ensure consistent timezone handling
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'unknown';
  }
  
  // Get current time
  const now = new Date();
  
  // Calculate the time difference in milliseconds
  // Account for timezone offset issues by using UTC times
  const nowUTC = now.getTime();
  const dateUTC = dateObj.getTime();
  
  // If the date appears to be in the future (timezone issue), adjust it
  let timeDiff = nowUTC - dateUTC;
  if (timeDiff < 0 && Math.abs(timeDiff) < 7200000) { // Less than 2 hours in the future
    // Likely a timezone issue, adjust by 1 hour (3600000 ms)
    timeDiff = timeDiff + 3600000;
  }
  
  // Convert to seconds
  const seconds = Math.floor(Math.abs(timeDiff) / 1000);
  
  // Less than a minute - show seconds
  if (seconds < 60) {
    return `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`;
  }
  
  // Less than an hour - show minutes
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Less than a day - show hours
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Less than a week - show days
  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  // Format as date if older than a week
  return dateObj.toLocaleDateString();
} 