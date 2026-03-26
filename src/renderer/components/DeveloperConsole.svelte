<script lang="ts">
  import { debugStore } from '../state/debug.svelte';
  import { fly } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import { Terminal } from 'lucide-svelte';
  import { animate } from 'motion';

  let command = $state('');
  let hasError = $state(false);
  let containerRef: HTMLDivElement | null = $state(null);

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (command.trim().length > 0) {
        // Stub for command execution, since nothing exists yet, throw an error
        console.log('Command executed:', command);
        
        hasError = true;
        if (containerRef) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          animate(containerRef as any, { x: [-10, 10, -10, 10, -5, 5, 0] }, { duration: 0.4 });
        }
        
        setTimeout(() => {
          hasError = false;
        }, 500);
      }
      command = '';
    }
  }

  // Pre-focus the input when console opens
  function captureFocus(node: HTMLInputElement) {
    node.focus();
    return {
      destroy() {}
    };
  }
</script>

{#if debugStore.isConsoleOpen}
  <div class="pointer-events-none absolute bottom-8 inset-x-0 z-50 flex justify-center"
       in:fly={{ y: 50, duration: 400, easing: backOut }}
       out:fly={{ y: 50, duration: 300 }}>
    
    <div 
      bind:this={containerRef}
      class="w-[65%] max-w-4xl bg-[#f4f4ec]/95 dark:bg-[#c7c7be]/95 backdrop-blur-md rounded-full shadow-2xl border p-2 flex items-center gap-3 pointer-events-auto overflow-hidden transition-colors duration-200
             {hasError ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] text-red-500' : 'border-slate-300 dark:border-slate-400'}"
    >
      
      <div class="ml-4 shrink-0 transition-colors duration-200 {hasError ? 'text-red-500' : 'text-slate-500 dark:text-slate-600 animate-pulse'}">
        <Terminal size={20} strokeWidth={2} />
      </div>

      <input 
        type="text" 
        bind:value={command}
        onkeydown={handleKeydown}
        use:captureFocus
        placeholder="Enter command..." 
        class="flex-1 bg-transparent border-none outline-none font-mono text-sm transition-colors duration-200
               {hasError ? 'text-red-500 placeholder:text-red-400/50' : 'text-slate-800 dark:text-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500'}"
        spellcheck="false"
        autocomplete="off"
      />

      <div class="mr-6 text-xs font-mono uppercase tracking-widest shrink-0 transition-colors duration-200 {hasError ? 'text-red-400' : 'text-slate-400 dark:text-slate-500'}">
        Developer Console
      </div>
    </div>
  </div>
{/if}
