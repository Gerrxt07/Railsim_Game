<script lang="ts">
  import { GameState, currentGameState, updateThemeClass } from './state/game.svelte';
  import { editorState } from './state/editor.svelte';
  import { circleReveal } from './actions/animations.svelte';
  import SplashScreen from './components/SplashScreen.svelte';
  import MainMenu from './components/MainMenu.svelte';
  import GameUI from './components/GameUI.svelte';
  import SettingsMenu from './components/SettingsMenu.svelte';
  import { fade } from 'svelte/transition';

  const gridSize = 40;
  const dotRadius = 1.5;

  let appVersion = $state('');

  $effect(() => {
    updateThemeClass();
    window.electronAPI?.getAppVersion()
      .then(v => appVersion = v)
      .catch(e => console.error("Failed to fetch app version:", e));
  });
</script>

<div class="w-screen h-screen bg-black relative">
  
  <main 
    use:circleReveal={() => currentGameState.value !== GameState.SPLASH && currentGameState.value !== GameState.INITIALIZING}
    class="absolute inset-0 bg-[#f4f4ec] dark:bg-[#c7c7be] transition-colors duration-500 overflow-hidden text-slate-900 z-10"
    class:running-cursor={currentGameState.value === GameState.RUNNING}
  >
    <!-- Subtiler Edge-Glow abhängig vom aktuellen Mode -->
    {#if currentGameState.value === GameState.RUNNING}
      <div 
        in:fade={{ duration: 1000, delay: 200 }}
        out:fade={{ duration: 800 }}
        class="absolute inset-0 pointer-events-none transition-shadow duration-700 ease-in-out z-20 
          {editorState.mode === 'BUILD' ? 'shadow-[inset_0_0_120px_rgba(20,184,166,0.15)]' : 'shadow-[inset_0_0_120px_rgba(168,85,247,0.15)]'}"
      ></div>
    {/if}

    <svg class="w-full h-full">
      <defs>
        <pattern id="dot-grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
          <circle cx={gridSize / 2} cy={gridSize / 2} r={dotRadius} class="fill-slate-300 dark:fill-slate-400" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-grid)" />
      
      <g id="network-layer">
        </g>
    </svg>
  </main>

  {#if currentGameState.value === GameState.SPLASH || currentGameState.value === GameState.INITIALIZING}
    <SplashScreen />
  {/if}

  {#if currentGameState.value === GameState.MAIN_MENU}
    <MainMenu />
  {/if}

  {#if currentGameState.value === GameState.RUNNING}
    <GameUI />
  {/if}

  <!-- Settings overlay -->
  <SettingsMenu />

  {#if appVersion && currentGameState.value !== GameState.SPLASH && currentGameState.value !== GameState.INITIALIZING}
    <div class="absolute bottom-4 right-4 text-slate-500/50 text-sm font-light pointer-events-none z-30">
      Version {appVersion}
    </div>
  {/if}
</div>

<style lang="postcss">
  .running-cursor {
    cursor: var(--circleCursor);
  }

  :global(:root) {
    --circleCursor: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cdefs%3E%3Cfilter id='shadow'%3E%3CfeDropShadow dx='1' dy='1' stdDeviation='1.5' flood-color='rgba(0,0,0,0.3)' /%3E%3C/filter%3E%3C/defs%3E%3Ccircle cx='12' cy='12' r='5' stroke='%2394a3b8' stroke-width='1.5' fill='none' filter='url(%23shadow)' /%3E%3C/svg%3E") 12 12, crosshair;
  }
</style>