<script lang="ts">
  import { debugStore } from '../state/debug.svelte';
  import { fly } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import { Terminal } from 'lucide-svelte';

  let command = $state('');

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      // Stub for command execution
      console.log('Command executed:', command);
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
    
    <div class="w-[65%] max-w-4xl bg-[#f4f4ec]/95 dark:bg-[#c7c7be]/95 backdrop-blur-md rounded-full shadow-2xl border border-slate-300 dark:border-slate-400 p-2 flex items-center gap-3 pointer-events-auto overflow-hidden">
      
      <div class="ml-4 text-slate-500 dark:text-slate-600 shrink-0 animate-pulse">
        <Terminal size={20} strokeWidth={2} />
      </div>

      <input 
        type="text" 
        bind:value={command}
        onkeydown={handleKeydown}
        use:captureFocus
        placeholder="Enter command..." 
        class="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-slate-900 font-mono text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
        spellcheck="false"
        autocomplete="off"
      />

      <div class="mr-6 text-xs text-slate-400 dark:text-slate-500 font-mono uppercase tracking-widest shrink-0">
        Developer Console
      </div>
    </div>
  </div>
{/if}
