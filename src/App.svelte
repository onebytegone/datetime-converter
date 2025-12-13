<script>
   import { onMount } from 'svelte';
   import { timezones } from './stores.js';
   import { loadTimezones, saveTimezones } from './utils/storage.js';
   import InputForm from './lib/InputForm.svelte';
   import AddTimezone from './lib/AddTimezone.svelte';
   import TimezoneList from './lib/TimezoneList.svelte';
   import './app.css';

   let saveTimer = null;

   onMount(() => {
      // Load saved timezones from localStorage
      const saved = loadTimezones();

      if (saved && Array.isArray(saved)) {
         timezones.set(saved);
      } else {
         // Set defaults: user's local timezone + UTC
         const userTz = getUserTimezone();
         timezones.set([userTz, 'UTC']);
      }

      // Subscribe to timezone changes and save (with debouncing)
      let isFirstLoad = true;

      const unsubscribe = timezones.subscribe(($tz) => {
         if (isFirstLoad) {
            isFirstLoad = false;
            return;
         }

         if (saveTimer) {
            clearTimeout(saveTimer);
         }

         saveTimer = setTimeout(() => {
            saveTimezones($tz);
         }, 500);
      });

      // Cleanup on unmount
      return () => {
         unsubscribe();
         if (saveTimer) {
            clearTimeout(saveTimer);
         }
      };
   });

   function getUserTimezone() {
      try {
         return Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch (error) {
         console.warn(
            'Failed to detect user timezone, falling back to UTC:',
            error
         );
         return 'UTC';
      }
   }
</script>

<main>
   <header>
      <h1>Datetime Converter</h1>
      <p>Simple timezone conversion for debugging and coordination</p>
   </header>

   <InputForm />
   <TimezoneList />
   <AddTimezone />
</main>

<style>
   main {
      max-width: 800px;
      margin: 0 auto;
      padding: var(--spacing);
   }

   header {
      margin-bottom: var(--spacing);
      text-align: center;
   }

   h1 {
      margin: 0 0 4px 0;
      font-size: 24px;
      color: var(--color-primary);
   }

   header p {
      margin: 0;
      color: var(--color-text);
      opacity: 0.8;
   }
</style>
