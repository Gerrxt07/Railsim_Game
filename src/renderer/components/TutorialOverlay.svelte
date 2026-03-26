<script lang="ts">
  import { fade, fly, scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import { uiState } from '../state/game.svelte';
  import { debugStore } from '../state/debug.svelte';
  import { t } from '../state/i18n.svelte';
  import { hoverBounce, tapPulse } from '../actions/animations.svelte';
  import { X } from 'lucide-svelte';

  const closePrompt = () => {
    uiState.showTutorialPrompt = false;
  };

  const acceptTutorial = () => {
    uiState.showTutorialPrompt = false;
    uiState.showTutorial = true;
  };

  const closeTutorial = () => {
    uiState.showTutorial = false;
  };

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (uiState.showTutorialPrompt) closePrompt();
      else if (uiState.showTutorial) closeTutorial();
    }
  };
</script>

{#snippet formattedText(text: string)}
  {#each text.split(/`([^`]+)`/g) as part, i}
    {#if i % 2 === 1}
      <kbd>{part}</kbd>
    {:else}
      {part}
    {/if}
  {/each}
{/snippet}

<svelte:window on:keydown={onKeydown} />

{#if uiState.showTutorialPrompt}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto" in:fade={{ duration: 300 }} out:fade={{ duration: 200 }}>
    <div 
      class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-slate-200 dark:border-slate-700 pointer-events-auto"
      in:scale={{ start: 0.95, opacity: 0, duration: 400, delay: 150, easing: backOut }}
      out:scale={{ start: 0.95, opacity: 0, duration: 200 }}
    >
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4 text-center">{t('tutorial.prompt.title')}</h2>
      <p class="text-slate-600 dark:text-slate-300 text-center mb-8">{t('tutorial.prompt.message')}</p>
      
      <div class="flex flex-col gap-3">
        <button 
          use:hoverBounce use:tapPulse
          class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          onclick={acceptTutorial}
        >
          {t('tutorial.prompt.yes')}
        </button>
        <button 
          use:hoverBounce use:tapPulse
          class="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors"
          onclick={closePrompt}
        >
          {t('tutorial.prompt.no')}
        </button>
      </div>
    </div>
  </div>
{/if}

{#if uiState.showTutorial}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md pointer-events-auto" in:fade={{ duration: 300 }} out:fade={{ duration: 200 }}>
    <div 
      class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] mx-4 flex flex-col border border-slate-200 dark:border-slate-700 pointer-events-auto"
      in:fly={{ y: 20, opacity: 0, duration: 400, delay: 100, easing: backOut }}
      out:fly={{ y: 20, opacity: 0, duration: 200 }}
    >
      <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h2 class="text-3xl font-bold text-slate-900 dark:text-white">{t('tutorial.title')}</h2>
        <button 
          use:hoverBounce use:tapPulse
          class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full transition-colors"
          onclick={closeTutorial}
        >
          <X class="w-6 h-6" />
        </button>
      </div>
      
      <div class="p-6 overflow-y-auto overflow-x-hidden flex-1 space-y-8 custom-scrollbar">
        <!-- Section 1 -->
        <div class="space-y-2">
          <h3 class="text-xl font-semibold text-blue-600 dark:text-blue-400">{t('tutorial.section.camera.title')}</h3>
          <p class="text-slate-600 dark:text-slate-300 leading-relaxed">{@render formattedText(t('tutorial.section.camera.desc'))}</p>
        </div>
        
        <!-- Section 2 -->
        <div class="space-y-2">
          <h3 class="text-xl font-semibold text-blue-600 dark:text-blue-400">{t('tutorial.section.modes.title')}</h3>
          <p class="text-slate-600 dark:text-slate-300 leading-relaxed">{@render formattedText(t('tutorial.section.modes.desc'))}</p>
        </div>
        
        <!-- Section 3 -->
        <div class="space-y-2">
          <h3 class="text-xl font-semibold text-blue-600 dark:text-blue-400">{t('tutorial.section.console.title')}</h3>
          <p class="text-slate-600 dark:text-slate-300 leading-relaxed">{@render formattedText(t('tutorial.section.console.desc', { hotkey: debugStore.consoleHotkey }))}</p>
        </div>
      </div>
      
      <div class="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-end">
        <button 
          use:hoverBounce use:tapPulse
          class="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          onclick={closeTutorial}
        >
          {t('tutorial.close')}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  :global(kbd) {
    background-color: rgb(241 245 249);
    border: 1px solid rgb(203 213 225);
    border-radius: 0.375rem;
    padding: 0.125rem 0.375rem;
    font-size: 0.875em;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-weight: 500;
    color: rgb(71 85 105);
    box-shadow: 0 1px 1px rgba(0,0,0,0.05);
  }

  :global(.dark kbd) {
    background-color: rgb(51 65 85);
    border-color: rgb(71 85 105);
    color: rgb(226 232 240);
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 20px;
  }
</style>