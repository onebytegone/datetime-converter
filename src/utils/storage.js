const STORAGE_KEY_TIMEZONES = 'datetime-converter-timezones';

/**
 * Save timezones array to localStorage
 * @param {string[]} timezones
 * @returns {boolean} - Success status
 */
export function saveTimezones(timezones) {
   try {
      if (!Array.isArray(timezones)) {
         console.error('saveTimezones: Expected array, got', typeof timezones);
         return false;
      }

      localStorage.setItem(STORAGE_KEY_TIMEZONES, JSON.stringify(timezones));
      return true;
   } catch (error) {
      console.error('localStorage save failed:', error);
      return false;
   }
}

/**
 * Load timezones array from localStorage
 * @returns {string[] | null} - Array of timezone strings or null if not found/invalid
 */
export function loadTimezones() {
   try {
      const stored = localStorage.getItem(STORAGE_KEY_TIMEZONES);

      if (!stored) {
         return null;
      }

      const parsed = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
         console.warn('loadTimezones: Stored value is not an array, clearing');
         localStorage.removeItem(STORAGE_KEY_TIMEZONES);
         return null;
      }

      return parsed;
   } catch (error) {
      console.error('localStorage load failed:', error);
      return null;
   }
}
