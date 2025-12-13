<script>
   import { onMount, onDestroy } from 'svelte';
   import { timestamp } from '../stores.js';
   import { parseTimestamp } from '../utils/parser.js';

   let inputValue = '';
   let errorMessage = '';
   let debounceTimer = null;
   let exampleUpdateInterval = null;
   let exampleTimestamps = {
      unix: 0,
      unixMs: 0,
      iso: '',
   };

   function _update_examples() {
      const now = new Date();
      exampleTimestamps.unix = Math.floor(now.getTime() / 1000);
      exampleTimestamps.unixMs = now.getTime();
      exampleTimestamps.iso = now.toISOString();
   }

   onMount(() => {
      // Check for query parameter
      const params = new URLSearchParams(window.location.search);
      const timeParam = params.get('time');

      if (timeParam) {
         inputValue = timeParam;
         handleParse();
      } else {
         // Default to current time in human readable format
         const now = new Date();
         inputValue = now.toISOString();
         handleParse();
      }

      // Update examples every second
      _update_examples();
      exampleUpdateInterval = setInterval(_update_examples, 1000);
   });

   onDestroy(() => {
      if (exampleUpdateInterval) {
         clearInterval(exampleUpdateInterval);
      }
   });

   function handleInput() {
      // Clear previous debounce timer
      if (debounceTimer) {
         clearTimeout(debounceTimer);
      }

      // Debounce parsing (300ms)
      debounceTimer = setTimeout(() => {
         handleParse();
      }, 300);
   }

   function handleParse() {
      const result = parseTimestamp(inputValue);

      if (result.success) {
         timestamp.set({
            date: result.date,
            format: result.format,
            timezone: result.timezone,
         });
         errorMessage = '';

         // Update URL
         const newUrl = `?time=${encodeURIComponent(inputValue)}`;
         window.history.replaceState(null, '', newUrl);
      } else {
         errorMessage = result.error;
         window.history.replaceState(null, '', window.location.pathname);
      }
   }

   function setToNow() {
      const now = new Date();
      inputValue = now.toISOString();
      handleParse();
   }

   function _set_example(value) {
      return () => {
         inputValue = value;
         handleParse();
      };
   }
</script>

<div class="input-form">
   <label for="timestamp-input">Enter timestamp</label>
   <div class="input-wrapper">
      <input
         id="timestamp-input"
         type="text"
         bind:value={inputValue}
         oninput={handleInput}
         aria-label="Timestamp input"
         placeholder="e.g., 2024-01-15T12:30:00Z"
      />
      <button
         class="now-btn"
         onclick={setToNow}
         aria-label="Set to current time"
      >
         Now
      </button>
   </div>
   <div class="examples">
      <span class="examples-label">Examples:</span>
      <button
         type="button"
         class="example-btn"
         onclick={_set_example(String(exampleTimestamps.unix))}
         aria-label="Use Unix timestamp example"
      >
         {exampleTimestamps.unix}
      </button>
      <button
         type="button"
         class="example-btn"
         onclick={_set_example(String(exampleTimestamps.unixMs))}
         aria-label="Use Unix millisecond timestamp example"
      >
         {exampleTimestamps.unixMs}
      </button>
      <button
         type="button"
         class="example-btn"
         onclick={_set_example(exampleTimestamps.iso)}
         aria-label="Use ISO timestamp example"
      >
         {exampleTimestamps.iso}
      </button>
   </div>
   {#if errorMessage}
      <div class="error" role="alert">{errorMessage}</div>
   {/if}
</div>

<style>
   .input-form {
      margin-bottom: var(--spacing);
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
   }

   label {
      display: block;
      margin-bottom: 4px;
      font-weight: 600;
   }

   .input-wrapper {
      display: flex;
      gap: 8px;
      align-items: stretch;
   }

   input {
      flex: 1;
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

   .now-btn {
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 600;
      border: 2px solid var(--color-border);
      border-radius: var(--border-radius);
      background: var(--color-bg);
      color: var(--color-text);
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
   }

   .now-btn:hover {
      background: var(--color-surface);
      border-color: var(--color-primary);
      color: var(--color-primary);
   }

   .now-btn:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
   }

   .examples {
      margin-top: 4px;
      font-size: 12px;
      color: var(--color-text-muted);
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
   }

   .examples-label {
      font-weight: 600;
   }

   .example-btn {
      background: var(--color-surface);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
      border: none;
      color: var(--color-text);
      cursor: pointer;
      transition: all 0.2s;
   }

   .example-btn:hover {
      background: var(--color-primary);
      color: white;
   }

   .example-btn:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
   }

   .error {
      margin-top: 8px;
      color: var(--color-primary);
      font-size: 14px;
   }
</style>
