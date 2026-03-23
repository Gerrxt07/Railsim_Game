<script lang="ts">
  import { fade } from 'svelte/transition';
  
  // Import our logos as Vite assets
  import splash_1_src from '../assets/content/Splash-Not_Unreal.png';
  import splash_2_src from '../assets/content/Splash-Liminal_Runtime.png';

  // Import game state management
  import { GameState, currentGameState, setGameState } from './state/game.svelte';

  // Grid/Dot definitions from previous step
  const gridSize = 40;
  const dotRadius = 1.5;

  // Track which splash logo is visible during the SPLASH phase
  let currentSplashIndex = $state(0);

  // Define the splash sequence (Image source and duration in ms)
  const splashSequence = [
    { src: splash_1_src, duration: 2000 }, // 2 seconds
    { src: splash_2_src, duration: 2000 }  // 2 seconds
  ];

  // Svelte 5 standard initialization effect (replaces onMount/onDestroy logic)
  $effect(() => {
    // Start the sequence after a tiny initialization delay
    const startSequence = async () => {
      // Step 1: Initializing -> Splash
      setGameState(GameState.SPLASH);

      // Step 2: Loop through each logo in the sequence
      for (let i = 0; i < splashSequence.length; i++) {
        currentSplashIndex = i; // Show current logo
        // Wait for the duration specified in the sequence object
        await new Promise(resolve => setTimeout(resolve, splashSequence[i].duration));
      }

      // Step 3: Splash is done -> Transition to Running
      // This will trigger the fade-out of the black overlay
      setGameState(GameState.RUNNING);
    };

    // Run the sequence once when the component mounts
    startSequence();
  });
</script>

<main 
  class="w-screen h-screen bg-[#f4f4ec] overflow-hidden relative text-slate-900"
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

  {#if currentGameState.value !== GameState.RUNNING}
    <div 
      class="absolute inset-0 bg-black flex items-center justify-center z-50 transition-all"
      transition:fade={{ duration: 1000 }}
    >
      {#key currentSplashIndex}
        <img 
          src={splashSequence[currentSplashIndex]?.src} 
          alt="Splash Logo" 
          class="absolute max-w-sm h-auto opacity-0 transition-opacity duration-500"
          style="opacity: 1;" 
          transition:fade={{ duration: 500 }}
        />
      {/key}
    </div>
  {/if}

</main>

<style lang="postcss">
  /* Special utility class to apply the custom cursor style */
  .running-cursor {
    cursor: var(--circleCursor);
  }

  /* Define the CSS variable from the Svelte script for use in style tag */
  :global(:root) {
    --circleCursor: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cdefs%3E%3Cfilter id='shadow'%3E%3CfeDropShadow dx='1' dy='1' stdDeviation='1.5' flood-color='rgba(0,0,0,0.3)' /%3E%3C/filter%3E%3C/defs%3E%3Ccircle cx='12' cy='12' r='5' stroke='%2394a3b8' stroke-width='1.5' fill='none' filter='url(%23shadow)' /%3E%3C/svg%3E") 12 12, crosshair;
  }
</style>