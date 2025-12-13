<script>
   import { timestamp, activeTimezones, timezones } from '../stores.js';
   import TimezoneDisplay from './TimezoneDisplay.svelte';
   import DaylightBar from './DaylightBar.svelte';
   import { getTimezoneOffset } from '../utils/formatter.js';

   function removeTimezone(tz) {
      timezones.update((current) => {
         return current.filter((t) => {
            return t !== tz;
         });
      });
   }

   function isRemovable(tz) {
      // Can't remove if it's the source timezone
      if ($timestamp && $timestamp.timezone === tz) {
         return false;
      }
      // Only removable if it's in the user's timezones list
      return $timezones.includes(tz);
   }

   function getTimezoneTitle(tz) {
      if (!$timestamp) {
         return tz;
      }
      const offset = getTimezoneOffset($timestamp.date, tz);
      return `${tz} (UTC${offset === 'Z' ? '' : offset})`;
   }
</script>

<div class="timezone-list">
   {#if !$timestamp}
      <p class="placeholder">Enter a timestamp to see conversions</p>
   {:else}
      {#each $activeTimezones as tz, index (tz)}
         {#if index > 0}
            <div class="divider"></div>
         {/if}
         <div class="timezone-item">
            <div class="timezone-header">
               <h3>{getTimezoneTitle(tz)}</h3>
               <div class="badge-container">
                  {#if isRemovable(tz)}
                     <button
                        class="remove-btn"
                        onclick={() => {
                           return removeTimezone(tz);
                        }}
                        aria-label="Remove {tz}"
                     >
                        ×
                     </button>
                  {:else if $timestamp && $timestamp.timezone === tz}
                     <span class="source-badge">Source</span>
                  {/if}
               </div>
            </div>
            <DaylightBar date={$timestamp.date} timezone={tz} />
            <TimezoneDisplay date={$timestamp.date} timezone={tz} />
         </div>
      {/each}
   {/if}
</div>

<style>
   .timezone-list {
      margin-top: var(--spacing);
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
   }

   .placeholder {
      text-align: center;
      padding: calc(var(--spacing) * 2);
      color: var(--color-text);
      opacity: 0.6;
   }

   .timezone-item {
      padding: var(--spacing) 0;
   }

   .divider {
      height: 1px;
      background: var(--color-divider);
      margin: 0;
   }

   .timezone-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
   }

   .timezone-header h3 {
      margin: 0;
      font-size: 16px;
      color: var(--color-text);
      font-weight: 600;
   }

   .badge-container {
      min-width: 70px;
      height: 32px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      flex-shrink: 0;
   }

   .remove-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: var(--color-text-muted);
      font-size: 20px;
      line-height: 1;
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      opacity: 0.5;
   }

   .remove-btn:hover {
      opacity: 1;
      background: var(--color-surface);
   }

   .remove-btn:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
   }

   .source-badge {
      background: var(--color-primary);
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      flex-shrink: 0;
   }
</style>
