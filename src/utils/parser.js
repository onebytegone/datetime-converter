/**
 * Parse a timestamp from various input formats
 * @param {string} input - The timestamp input string
 * @returns {{success: boolean, date?: Date, format?: string, timezone?: string, error?: string}}
 */
export function parseTimestamp(input) {
   const trimmed = input.trim();

   if (!trimmed) {
      return {
         success: false,
         error: "That doesn't look like a timestamp I recognize 🤔",
      };
   }

   // Try epoch in seconds (10 digits)
   if (/^\d{10}$/.test(trimmed)) {
      const timestamp = parseInt(trimmed, 10);
      const date = new Date(timestamp * 1000);

      if (isValidDate(date)) {
         return {
            success: true,
            date,
            format: 'epoch-seconds',
            timezone: 'UTC',
         };
      }
   }

   // Try epoch in milliseconds (13 digits)
   if (/^\d{13}$/.test(trimmed)) {
      const timestamp = parseInt(trimmed, 10);
      const date = new Date(timestamp);

      if (isValidDate(date)) {
         return {
            success: true,
            date,
            format: 'epoch-milliseconds',
            timezone: 'UTC',
         };
      }
   }

   // Try ISO 8601
   if (trimmed.includes('T') || trimmed.includes('-')) {
      try {
         const date = new Date(trimmed);

         if (isValidDate(date)) {
            const timezone = extractTimezoneFromISO(trimmed);
            return {
               success: true,
               date,
               format: 'iso8601',
               timezone,
            };
         }
      } catch {
         // Fall through to error
      }
   }

   return {
      success: false,
      error: "That doesn't look like a timestamp I recognize 🤔",
   };
}

/**
 * Check if a date is valid and within reasonable bounds (1900-2100)
 * @param {Date} date
 * @returns {boolean}
 */
function isValidDate(date) {
   if (!(date instanceof Date) || isNaN(date.getTime())) {
      return false;
   }

   const year = date.getFullYear();
   return year >= 1900 && year <= 2100;
}

/**
 * Extract timezone from ISO 8601 string
 * Maps timezone offsets to likely IANA timezone identifiers
 * @param {string} isoString
 * @returns {string}
 */
function extractTimezoneFromISO(isoString) {
   // Check for Z (UTC)
   if (isoString.endsWith('Z')) {
      return 'UTC';
   }

   // Check for timezone offset like +05:00 or -05:00
   const offsetMatch = isoString.match(/([+-]\d{2}):?(\d{2})$/);
   if (offsetMatch) {
      return mapOffsetToTimezone(offsetMatch[1] + offsetMatch[2]);
   }

   // No timezone info, use user's local timezone
   return getUserTimezone();
}

/**
 * Map timezone offset to IANA timezone identifier
 * @param {string} offset - Offset string like '+0530' or '-0500'
 * @returns {string}
 */
function mapOffsetToTimezone(offset) {
   const offsetMap = {
      '-1200': 'Etc/GMT+12',
      '-1100': 'Pacific/Midway',
      '-1000': 'Pacific/Honolulu',
      '-0930': 'Pacific/Marquesas',
      '-0900': 'America/Anchorage',
      '-0800': 'America/Los_Angeles',
      '-0700': 'America/Denver',
      '-0600': 'America/Chicago',
      '-0500': 'America/New_York',
      '-0400': 'America/Halifax',
      '-0330': 'America/St_Johns',
      '-0300': 'America/Sao_Paulo',
      '-0200': 'Atlantic/South_Georgia',
      '-0100': 'Atlantic/Azores',
      '+0000': 'UTC',
      '+0100': 'Europe/London',
      '+0200': 'Europe/Paris',
      '+0300': 'Europe/Moscow',
      '+0330': 'Asia/Tehran',
      '+0400': 'Asia/Dubai',
      '+0430': 'Asia/Kabul',
      '+0500': 'Asia/Karachi',
      '+0530': 'Asia/Kolkata',
      '+0545': 'Asia/Kathmandu',
      '+0600': 'Asia/Dhaka',
      '+0630': 'Asia/Yangon',
      '+0700': 'Asia/Bangkok',
      '+0800': 'Asia/Singapore',
      '+0845': 'Australia/Eucla',
      '+0900': 'Asia/Tokyo',
      '+0930': 'Australia/Adelaide',
      '+1000': 'Australia/Sydney',
      '+1030': 'Australia/Lord_Howe',
      '+1100': 'Pacific/Guadalcanal',
      '+1200': 'Pacific/Fiji',
      '+1245': 'Pacific/Chatham',
      '+1300': 'Pacific/Tongatapu',
      '+1400': 'Pacific/Kiritimati',
   };

   return offsetMap[offset] || 'UTC';
}

/**
 * Get the user's local timezone
 * @returns {string}
 */
function getUserTimezone() {
   try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
   } catch {
      return 'UTC';
   }
}
