<script context="module">
   /**
    * Calculate marker position within the current hour
    * @param {Date} date - The date/time
    * @param {string} timezone - IANA timezone name
    * @returns {number} - Offset percentage within the centered hour
    */
   function getMarkerOffset(date, timezone) {
      try {
         const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            minute: 'numeric',
            second: 'numeric',
            hour12: false,
         });

         const parts = {};
         formatter.formatToParts(date).forEach((part) => {
            parts[part.type] = part.value;
         });

         const minutes = parseInt(parts.minute, 10);
         const seconds = parseInt(parts.second, 10);

         // Calculate how far through the current hour we are
         const totalSeconds = minutes * 60 + seconds;
         const secondsInHour = 60 * 60;
         const progressThroughHour = totalSeconds / secondsInHour;

         // Each hour is 100/24% of the viewport width
         const hourWidthInViewport = 100 / 24;

         return progressThroughHour * hourWidthInViewport;
      } catch {
         return 0;
      }
   }

   /**
    * Get the 24 hours to display, wrapping around midnight
    * @param {Date} date - The date/time
    * @param {string} timezone - IANA timezone name
    * @returns {Array} - Array of hour objects with hour number and day offset
    */
   function getDisplayHours(date, timezone) {
      try {
         const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: 'numeric',
            hour12: false,
         });

         const parts = {};
         formatter.formatToParts(date).forEach((part) => {
            parts[part.type] = part.value;
         });

         const currentHour = parseInt(parts.hour, 10);

         // We want to show 12 hours before and 11 hours after (24 total with current in middle)
         const hours = [];
         for (let i = -12; i <= 11; i++) {
            const hour = (currentHour + i + 24) % 24;
            hours.push(hour);
         }

         return hours;
      } catch {
         return Array.from({ length: 24 }, (_, i) => {
            return i;
         });
      }
   }

   /**
    * Get day/night sections for the visible 24-hour window
    * @param {Date} date - The date/time
    * @param {string} timezone - IANA timezone name
    * @returns {Array} - Array of section objects
    */
   function getDayNightSections(date, timezone) {
      try {
         const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: 'numeric',
            hour12: false,
         });

         const parts = {};
         formatter.formatToParts(date).forEach((part) => {
            parts[part.type] = part.value;
         });

         const currentHour = parseInt(parts.hour, 10);
         const startHour = (currentHour - 12 + 24) % 24;

         // Build hour-by-hour map with section info
         const hourSections = [];
         let midnightTransitionIndex = -1;

         for (let i = 0; i < 24; i++) {
            const hour = (startHour + i) % 24;
            const type = hour >= 6 && hour < 21 ? 'day' : 'night';
            hourSections.push({ hour, type });

            // Detect midnight transition (23 -> 0)
            if (i > 0 && hourSections[i - 1].hour === 23 && hour === 0) {
               midnightTransitionIndex = i;
            }
         }

         // Merge consecutive same-type sections, but force split at midnight transition
         const sections = [];
         let currentType = hourSections[0].type;
         let currentWidth = 0;
         let sectionStartIndex = 0;
         let sectionEndIndex = 0;

         for (let i = 0; i < 24; i++) {
            const shouldSplit = i === midnightTransitionIndex;

            if (hourSections[i].type === currentType && !shouldSplit) {
               currentWidth += 4.1667; // 100/24
               sectionEndIndex = i;
            } else {
               sections.push({
                  type: currentType,
                  width: currentWidth,
                  startIndex: sectionStartIndex,
                  endIndex: sectionEndIndex,
                  isDayStart: false,
                  isDayEnd: false,
               });
               currentType = hourSections[i].type;
               currentWidth = 4.1667;
               sectionStartIndex = i;
               sectionEndIndex = i;
            }
         }

         // Add final section
         sections.push({
            type: currentType,
            width: currentWidth,
            startIndex: sectionStartIndex,
            endIndex: sectionEndIndex,
            isDayStart: false,
            isDayEnd: false,
         });

         // Apply rounded corners at midnight transition (23->0)
         if (midnightTransitionIndex > 0) {
            sections.forEach((section) => {
               // Section ending at hour 23 (just before midnight)
               if (section.endIndex === midnightTransitionIndex - 1) {
                  section.isDayEnd = true;
               }
               // Section starting at hour 0 (midnight)
               if (section.startIndex === midnightTransitionIndex) {
                  section.isDayStart = true;
               }
            });
         }

         return sections;
      } catch {
         return [];
      }
   }
</script>

<script>
   export let date;
   export let timezone;

   $: displayHours = getDisplayHours(date, timezone);
   $: dayNightSections = getDayNightSections(date, timezone);
   $: markerOffset = getMarkerOffset(date, timezone);
</script>

<div
   class="daylight-bar"
   role="img"
   aria-label="24-hour daylight timeline for {timezone}"
>
   <div class="bar-wrapper">
      <div class="bar-container">
         {#each dayNightSections as section (section.start + section.type)}
            <div
               class={section.type}
               class:day-start={section.isDayStart}
               class:day-end={section.isDayEnd}
               style="width: {section.width}%;"
            ></div>
         {/each}

         <div class="hours-overlay">
            {#each displayHours as hour (hour)}
               <div class="hour-marker" class:no-divider={hour === 0}>
                  {hour}
               </div>
            {/each}
         </div>
      </div>
      <div
         class="current-time"
         style="left: calc(50% + {markerOffset}%);"
      ></div>
   </div>
</div>

<style>
   .daylight-bar {
      margin-bottom: var(--spacing);
   }

   .bar-wrapper {
      position: relative;
      padding: 12px 0;
   }

   .bar-container {
      position: relative;
      display: flex;
      height: 48px;
      width: 100%;
   }

   .night {
      background: var(--color-night);
   }

   .day {
      background: var(--color-day);
   }

   .day-start {
      border-radius: 24px 0 0 24px;
   }

   .day-end {
      border-radius: 0 24px 24px 0;
   }

   .hours-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      display: flex;
   }

   .hour-marker {
      position: relative;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      color: var(--color-text);
      opacity: 0.9;
   }

   .hour-marker::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 1px;
      background: rgba(0, 0, 0, 0.15);
   }

   .hour-marker.no-divider::before {
      display: none;
   }

   @media (prefers-color-scheme: dark) {
      .hour-marker::before {
         background: rgba(255, 255, 255, 0.15);
      }
   }

   .current-time {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      width: 2px;
      background: var(--color-primary);
      z-index: 10;
      pointer-events: none;
      transform: translateX(-50%);
   }

   .current-time::before,
   .current-time::after {
      content: '';
      position: absolute;
      left: 50%;
      width: 8px;
      height: 8px;
      background: var(--color-primary);
      transform: translateX(-50%);
      border-radius: 50%;
   }

   .current-time::before {
      top: -4px;
   }

   .current-time::after {
      bottom: -4px;
   }
</style>
