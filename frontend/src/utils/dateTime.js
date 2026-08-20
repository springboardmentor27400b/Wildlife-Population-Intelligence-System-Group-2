/**
 * Centralized Date & Time Utility for Asia/Kolkata (IST) Timezone Conversion
 */

/**
 * Normalizes an input timestamp into a Date object assuming UTC if no offset is present.
 * Robustly parses standard ISO strings, text dates, unix timestamps, and legacy formatted strings.
 * @param {string | number | Date} input 
 * @returns {Date | null}
 */
export const parseUTCTimestamp = (input) => {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;

  let strInput = String(input).trim();
  if (!strInput || strInput === 'N/A' || strInput === 'null' || strInput === 'undefined') return null;

  // Pure numeric string (e.g., unix ms)
  if (/^\d+$/.test(strInput)) {
    const num = Number(strInput);
    return isNaN(num) ? null : new Date(num);
  }

  // Remove 'at' if present (e.g., '2026-08-16 at 18:47:55')
  strInput = strInput.replace(/\s+at\s+/i, ' ');

  // If string matches YYYY-MM-DD HH:MM:SS or YYYY-MM-DDTHH:MM:SS
  if (/^\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}/.test(strInput)) {
    strInput = strInput.replace(' ', 'T');
    if (!strInput.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(strInput)) {
      strInput += 'Z';
    }
  }

  const date = new Date(strInput);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Formats a UTC timestamp into a consistent IST date & time string.
 * Example: "17 Aug 2026, 12:17 AM"
 * @param {string | number | Date} input 
 * @param {object} options 
 * @returns {string}
 */
export const formatToIST = (input, options = {}) => {
  const date = parseUTCTimestamp(input);
  if (!date) return options.fallback || 'N/A';

  const defaultOptions = {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options
  };

  try {
    return new Intl.DateTimeFormat('en-IN', defaultOptions).format(date);
  } catch (err) {
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
  }
};

/**
 * Formats a UTC timestamp to IST Date string.
 * Example: "17 Aug 2026"
 * @param {string | number | Date} input 
 * @param {string} fallback 
 * @returns {string}
 */
export const formatISTDate = (input, fallback = 'N/A') => {
  const date = parseUTCTimestamp(input);
  if (!date) return fallback;

  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch (err) {
    return fallback;
  }
};

/**
 * Formats a UTC timestamp to IST Time string.
 * Example: "12:17 AM"
 * @param {string | number | Date} input 
 * @param {string} fallback 
 * @returns {string}
 */
export const formatISTTime = (input, fallback = 'N/A') => {
  const date = parseUTCTimestamp(input);
  if (!date) return fallback;

  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (err) {
    return fallback;
  }
};
