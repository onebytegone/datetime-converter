/**
 * Format a date as Unix epoch (seconds)
 * @param {Date} date
 * @returns {number}
 */
export function formatEpoch(date) {
   return Math.floor(date.getTime() / 1000);
}

/**
 * Format a date as ISO 8601 string in a specific timezone
 * @param {Date} date
 * @param {string} timezone - IANA timezone name
 * @returns {string}
 */
export function formatIso8601(date, timezone) {
   try {
      // Get date parts in the target timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
         timeZone: timezone,
         year: 'numeric',
         month: '2-digit',
         day: '2-digit',
         hour: '2-digit',
         minute: '2-digit',
         second: '2-digit',
         hour12: false,
      });

      const parts = {};
      formatter.formatToParts(date).forEach((part) => {
         parts[part.type] = part.value;
      });

      // Build ISO 8601 string
      const isoString = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;

      // Add timezone offset
      const offset = getTimezoneOffset(date, timezone);
      return `${isoString}${offset}`;
   } catch {
      // Fallback to UTC
      return date.toISOString();
   }
}

/**
 * Format a date as human-readable string in a specific timezone
 * @param {Date} date
 * @param {string} timezone - IANA timezone name
 * @returns {string}
 */
export function formatHuman(date, timezone) {
   try {
      const formatter = new Intl.DateTimeFormat('en-US', {
         timeZone: timezone,
         weekday: 'long',
         year: 'numeric',
         month: 'long',
         day: 'numeric',
         hour: 'numeric',
         minute: '2-digit',
         timeZoneName: 'short',
      });

      return formatter.format(date);
   } catch {
      return date.toString();
   }
}

/**
 * Get timezone abbreviation for a date in a specific timezone
 * @param {Date} date
 * @param {string} timezone - IANA timezone name
 * @returns {string}
 */
export function getTimezoneAbbreviation(date, timezone) {
   try {
      const formatter = new Intl.DateTimeFormat('en-US', {
         timeZone: timezone,
         timeZoneName: 'short',
      });

      const parts = formatter.formatToParts(date);
      const timeZonePart = parts.find((part) => {
         return part.type === 'timeZoneName';
      });

      return timeZonePart ? timeZonePart.value : timezone;
   } catch {
      return timezone;
   }
}

/**
 * Get the timezone offset string for a date in a specific timezone
 * @param {Date} date
 * @param {string} timezone - IANA timezone name
 * @returns {string} - Format: +HH:MM or -HH:MM or Z
 */
export function getTimezoneOffset(date, timezone) {
   try {
      // Special case for UTC
      if (timezone === 'UTC' || timezone.startsWith('UTC')) {
         if (timezone === 'UTC') {
            return 'Z';
         }
         // Handle UTC±X format
         const match = timezone.match(/UTC([+-]\d+)/);
         if (match) {
            const hours = parseInt(match[1], 10);
            const sign = hours >= 0 ? '+' : '';
            return `${sign}${String(Math.abs(hours)).padStart(2, '0')}:00`;
         }
         return 'Z';
      }

      // Use Intl API to get offset
      const formatter = new Intl.DateTimeFormat('en-US', {
         timeZone: timezone,
         timeZoneName: 'shortOffset',
      });
      const parts = formatter.formatToParts(date);
      const offsetPart = parts.find((p) => {
         return p.type === 'timeZoneName';
      });

      if (!offsetPart || offsetPart.value === 'GMT') {
         return 'Z';
      }

      // Parse offset like "GMT+5:30" or "GMT-8"
      const match = offsetPart.value.match(/GMT([+-]?)(\d+)(?::(\d+))?/);
      if (!match) {
         return 'Z';
      }

      const sign = match[1] || '+';
      const hours = parseInt(match[2], 10);
      const minutes = parseInt(match[3] || '0', 10);

      return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
   } catch {
      return 'Z';
   }
}
