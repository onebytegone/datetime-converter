import { writable, derived } from 'svelte/store';

/**
 * Get numeric offset in minutes for a timezone
 * @param {Date} date
 * @param {string} timezone
 * @returns {number}
 */
function getOffsetMinutes(date, timezone) {
   try {
      const formatter = new Intl.DateTimeFormat('en-US', {
         timeZone: timezone,
         timeZoneName: 'shortOffset',
      });
      const parts = formatter.formatToParts(date);
      const offsetPart = parts.find((p) => {
         return p.type === 'timeZoneName';
      });

      if (!offsetPart || offsetPart.value === 'GMT') {
         return 0;
      }

      // Parse offset like "GMT+5:30" or "GMT-8"
      const match = offsetPart.value.match(/GMT([+-]?)(\d+)(?::(\d+))?/);
      if (!match) {
         return 0;
      }

      const sign = match[1] === '-' ? -1 : 1;
      const hours = parseInt(match[2], 10);
      const minutes = parseInt(match[3] || '0', 10);

      return sign * (hours * 60 + minutes);
   } catch {
      return 0;
   }
}

/**
 * @typedef {Object} TimestampValue
 * @property {Date} date - The parsed date object
 * @property {string} format - Format type: 'epoch-seconds' | 'epoch-milliseconds' | 'iso8601'
 * @property {string} timezone - IANA timezone identifier where timestamp originated
 */

/**
 * Timestamp store
 * @type {import('svelte/store').Writable<TimestampValue | null>}
 */
export const timestamp = writable(null);

/**
 * User-selected timezones store
 * @type {import('svelte/store').Writable<string[]>}
 */
export const timezones = writable([]);

/**
 * Active timezones derived store
 * Combines user-selected timezones with the source timezone
 * Sorted by UTC offset
 * @type {import('svelte/store').Readable<string[]>}
 */
export const activeTimezones = derived(
   [timestamp, timezones],
   ([$timestamp, $timezones]) => {
      const result = [...$timezones];

      // Add source timezone if it exists and isn't already in the list
      if ($timestamp && $timestamp.timezone) {
         if (!result.includes($timestamp.timezone)) {
            result.push($timestamp.timezone);
         }
      }

      // Sort by offset if we have a timestamp
      if ($timestamp && $timestamp.date) {
         result.sort((a, b) => {
            return (
               getOffsetMinutes($timestamp.date, a) -
               getOffsetMinutes($timestamp.date, b)
            );
         });
      }

      return result;
   }
);
