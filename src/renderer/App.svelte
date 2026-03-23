<script lang="ts">
  import { GameState, currentGameState } from './state/game.svelte';
  import { circleReveal } from './actions/animations.svelte';
  import SplashScreen from './components/SplashScreen.svelte';

  const gridSize = 40;
  const dotRadius = 1.5;
</script>

<div class="w-screen h-screen bg-black relative">
  
  <main 
    use:circleReveal={() => currentGameState.value === GameState.RUNNING}
    class="absolute inset-0 bg-[#f4f4ec] overflow-hidden text-slate-900 z-10"
    class:running-cursor={currentGameState.value === GameState.RUNNING}
  >
    <svg class="w-full h-full">
      <defs>
        <pattern id="dot-grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
          <circle cx={gridSize / 2} cy={gridSize / 2} r={dotRadius} class="fill-slate-300" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-grid)" />
      
      <g id="network-layer">
        </g>
    </svg>
  </main>

  {#if currentGameState.value !== GameState.RUNNING}
    <SplashScreen />
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