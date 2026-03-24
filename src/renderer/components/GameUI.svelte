<script lang="ts">
  import ModeToggle from './ModeToggle.svelte';
  import TimeControls from './TimeControls.svelte';
  import { toggleSettings, simState, uiState } from '../state/game.svelte';
  import { fly, fade } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import { Settings } from 'lucide-svelte';

  // State to handle the transient popup
  let showSpeedPopup = $state(false);
  let popupTimeout: ReturnType<typeof setTimeout>;
  
  $effect(() => {
    // Triggers when simState.speed changes
    const _ = simState.speed;
    if (uiState.showSpeedPopups) {
      showSpeedPopup = true;
      clearTimeout(popupTimeout);
      popupTimeout = setTimeout(() => {
        showSpeedPopup = false;
      }, 500); // 0.5s visibility before it fades out
    }
  });
</script>

<div class="pointer-events-none absolute inset-0 z-20"
     in:fly={{ y: -40, opacity: 0, duration: 800, delay: 100, easing: backOut }}
     out:fly={{ y: -40, opacity: 0, duration: 400 }}
>
  <div class="pointer-events-auto flex w-full justify-center pt-6 relative">
    <ModeToggle />

    <!-- Top Right Controls -->
    <div class="absolute right-6 top-6 flex items-center gap-4"
         in:fly={{ y: -20, opacity: 0, duration: 600, delay: 300, easing: backOut }}>
      <TimeControls />

      <!-- Settings Button -->
      <button 
        class="w-10 h-10 flex items-center justify-center rounded-full bg-[#f4f4ec] dark:bg-[#c7c7be] border border-slate-300 dark:border-slate-400 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.05),0_4px_8px_-2px_rgba(0,0,0,0.1)] transition-all duration-300 hover:shadow-[inset_0_-2px_4px_rgba(0,0,0,0.05),0_6px_12px_-2px_rgba(0,0,0,0.15)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-px text-slate-600 hover:text-slate-900 focus:outline-none"
        onclick={() => toggleSettings(true)}
        aria-label="Open Settings"
      >
        <Settings class="h-5 w-5" strokeWidth={1.5} />
      </button>
    </div>
  </div>
</div>

<!-- Speed Change Popup Indicator -->
{#if showSpeedPopup}
  <div class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
       in:fade={{ duration: 100 }} 
       out:fly={{ y: -30, opacity: 0, duration: 800, easing: backOut }}>
    <div class="text-[6rem] font-black opacity-30 dark:opacity-40 blur-[0.5px] font-sans pointer-events-none select-none
       tracking-widest"
      style="font-family: ui-rounded, 'SF Pro Rounded', 'Helvetica Neue', Arial, sans-serif;"
      class:text-red-500={simState.speed === 0}
      class:text-green-500={simState.speed === 1}
      class:text-blue-500={simState.speed === 2}
      class:text-pink-500={simState.speed === 4}
    >
      {simState.speed === 0 ? 'II' : `${simState.speed}x`}
    </div>
  </div>
{/if}
