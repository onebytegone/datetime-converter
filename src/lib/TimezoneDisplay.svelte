<script>
   import {
      formatEpoch,
      formatIso8601,
      formatHuman,
   } from '../utils/formatter.js';

   let { date, timezone } = $props();

   let epoch = $derived(formatEpoch(date));
   let iso = $derived(formatIso8601(date, timezone));
   let human = $derived(formatHuman(date, timezone));

   let copyStates = $state({
      epoch: 'idle',
      iso: 'idle',
      human: 'idle',
   });

   async function copyToClipboard(text, field) {
      try {
         await navigator.clipboard.writeText(text);
         copyStates[field] = 'success';
         setTimeout(() => {
            copyStates[field] = 'idle';
         }, 2000);
      } catch (err) {
         console.error('Failed to copy:', err);
         copyStates[field] = 'error';
         setTimeout(() => {
            copyStates[field] = 'idle';
         }, 2000);
      }
   }

   function getCopyText(state) {
      if (state === 'success') {
         return 'Copied!';
      }
      if (state === 'error') {
         return 'Failed';
      }
      return 'Copy';
   }
</script>

<article class="timezone-display" aria-label="Timezone {timezone}">
   <dl>
      <dt>Unix Epoch:</dt>
      <dd class="value-row">
         <span class="monospace">{epoch}</span>
         <button
            class="copy-btn"
            class:success={copyStates.epoch === 'success'}
            class:error={copyStates.epoch === 'error'}
            onclick={() => {
               return copyToClipboard(String(epoch), 'epoch');
            }}
            aria-label="Copy epoch"
         >
            {getCopyText(copyStates.epoch)}
         </button>
      </dd>
      <dt>ISO 8601:</dt>
      <dd class="value-row">
         <span class="monospace">{iso}</span>
         <button
            class="copy-btn"
            class:success={copyStates.iso === 'success'}
            class:error={copyStates.iso === 'error'}
            onclick={() => {
               return copyToClipboard(iso, 'iso');
            }}
            aria-label="Copy ISO 8601"
         >
            {getCopyText(copyStates.iso)}
         </button>
      </dd>
      <dt>Human:</dt>
      <dd class="value-row">
         <span>{human}</span>
         <button
            class="copy-btn"
            class:success={copyStates.human === 'success'}
            class:error={copyStates.human === 'error'}
            onclick={() => {
               return copyToClipboard(human, 'human');
            }}
            aria-label="Copy human readable"
         >
            {getCopyText(copyStates.human)}
         </button>
      </dd>
   </dl>
</article>

<style>
   .timezone-display {
      padding: 0;
   }

   dl {
      margin: 0;
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 8px 12px;
   }

   dt {
      font-weight: 600;
      color: var(--color-text-muted);
      font-size: 14px;
   }

   dd {
      margin: 0;
   }

   .value-row {
      display: flex;
      align-items: center;
      gap: 8px;
   }

   .value-row span {
      flex: 1;
      font-size: 14px;
   }

   .monospace {
      font-family: var(--font-mono);
      font-size: 14px;
   }

   .copy-btn {
      padding: 4px 12px;
      font-size: 12px;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      background: transparent;
      color: var(--color-text-muted);
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
   }

   .copy-btn:hover {
      background: var(--color-surface);
      color: var(--color-primary);
      border-color: var(--color-primary);
   }

   .copy-btn.success {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
   }

   .copy-btn.error {
      background: #ef4444;
      color: white;
      border-color: #ef4444;
   }
</style>
