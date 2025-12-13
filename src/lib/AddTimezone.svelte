<script>
   import { timezones } from '../stores.js';
   import { getTimezoneOffset } from '../utils/formatter.js';

   let searchQuery = '';
   let availableTimezones = [];

   // Get list of available timezones
   try {
      if (typeof Intl !== 'undefined' && Intl.supportedValuesOf) {
         availableTimezones = Intl.supportedValuesOf('timeZone');
      } else {
         // Fallback list of common timezones
         availableTimezones = [
            'UTC',
            'America/New_York',
            'America/Chicago',
            'America/Denver',
            'America/Los_Angeles',
            'America/Toronto',
            'America/Vancouver',
            'America/Mexico_City',
            'America/Sao_Paulo',
            'America/Buenos_Aires',
            'Europe/London',
            'Europe/Paris',
            'Europe/Berlin',
            'Europe/Madrid',
            'Europe/Rome',
            'Europe/Amsterdam',
            'Europe/Brussels',
            'Europe/Vienna',
            'Europe/Stockholm',
            'Europe/Moscow',
            'Africa/Cairo',
            'Africa/Johannesburg',
            'Asia/Dubai',
            'Asia/Kolkata',
            'Asia/Bangkok',
            'Asia/Singapore',
            'Asia/Hong_Kong',
            'Asia/Tokyo',
            'Asia/Seoul',
            'Asia/Shanghai',
            'Australia/Sydney',
            'Australia/Melbourne',
            'Pacific/Auckland',
         ];
      }
   } catch {
      availableTimezones = ['UTC'];
   }

   $: allFiltered = availableTimezones.filter((tz) => {
      return tz.toLowerCase().includes(searchQuery.toLowerCase());
   });

   $: filteredTimezones = allFiltered.slice(0, 20);
   $: hasMoreResults = allFiltered.length > 20;

   function addTimezone(tz) {
      timezones.update((current) => {
         if (!current.includes(tz)) {
            return [...current, tz];
         }
         return current;
      });
      searchQuery = '';
   }

   function getOffset(tz) {
      const now = new Date();
      const offset = getTimezoneOffset(now, tz);
      return offset === 'Z' ? 'UTC' : `UTC${offset}`;
   }
</script>

<div class="add-timezone">
   <div class="divider"></div>
   <div class="add-timezone-content">
      <label for="timezone-search">Add Timezone</label>
      <input
         id="timezone-search"
         type="text"
         bind:value={searchQuery}
         placeholder="Search timezones..."
         role="combobox"
         aria-autocomplete="list"
         aria-label="Search timezones"
         aria-expanded={searchQuery.length > 0}
         aria-controls="timezone-results"
      />

      {#if searchQuery}
         <ul id="timezone-results" class="timezone-results" role="listbox">
            {#each filteredTimezones as tz (tz)}
               <li role="option" aria-selected="false">
                  <button
                     onclick={() => {
                        return addTimezone(tz);
                     }}
                  >
                     <span class="tz-name">{tz}</span>
                     <span class="tz-offset">{getOffset(tz)}</span>
                  </button>
               </li>
            {:else}
               <li class="no-results">No matches found</li>
            {/each}
            {#if hasMoreResults}
               <li class="more-results">
                  + {allFiltered.length - 20} more (keep typing to refine)
               </li>
            {/if}
         </ul>
      {/if}
   </div>
</div>

<style>
   .add-timezone {
      margin-top: var(--spacing);
   }

   .divider {
      height: 1px;
      background: var(--color-divider);
      margin-bottom: var(--spacing);
   }

   .add-timezone-content {
      max-width: 600px;
      margin: 0 auto;
      position: relative;
   }

   label {
      display: block;
      margin-bottom: 4px;
      font-weight: 600;
      text-align: center;
   }

   input {
      width: 100%;
      padding: 8px;
      font-size: 14px;
      border: 2px solid var(--color-border);
      border-radius: var(--border-radius);
      background: var(--color-bg);
      color: var(--color-text);
   }

   input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
   }

   .timezone-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      max-height: 300px;
      overflow-y: auto;
      background: var(--color-bg);
      border: 2px solid var(--color-border);
      border-top: none;
      border-radius: 0 0 var(--border-radius) var(--border-radius);
      list-style: none;
      margin: 0;
      padding: 0;
      z-index: 100;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
   }

   .timezone-results li {
      border-bottom: 1px solid var(--color-divider);
   }

   .timezone-results li:last-child {
      border-bottom: none;
   }

   .timezone-results button {
      width: 100%;
      padding: 12px;
      border: none;
      background: none;
      color: var(--color-text);
      text-align: left;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
   }

   .timezone-results button:hover {
      background: var(--color-surface);
   }

   .timezone-results button:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: -2px;
   }

   .tz-name {
      flex: 1;
   }

   .tz-offset {
      color: var(--color-text-muted);
      font-family: var(--font-mono);
      font-size: 12px;
      margin-left: 12px;
   }

   .no-results {
      padding: 12px;
      color: var(--color-text);
      opacity: 0.6;
      font-size: 14px;
   }

   .more-results {
      padding: 12px;
      color: var(--color-text-muted);
      font-size: 13px;
      font-style: italic;
      text-align: center;
      border-top: 1px solid var(--color-divider);
   }
</style>
