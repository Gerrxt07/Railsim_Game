<script lang="ts">
  import splash_1_src from '../assets/content/Splash-Not_Unreal.png';
  import splash_2_src from '../assets/content/Splash-Liminal_Runtime.png';

  import { GameState, currentGameState, setGameState } from './state/game.svelte';
  
  import { animate } from 'motion';

  const gridSize = 40;
  const dotRadius = 1.5;

  let currentSplashIndex = $state(0);

  const splashSequence = [
    { src: splash_1_src, duration: 3500 },
    { src: splash_2_src, duration: 3500 }
  ];

  $effect(() => {
    const startSequence = async () => {
      setGameState(GameState.SPLASH);

      for (let i = 0; i < splashSequence.length; i++) {
        currentSplashIndex = i;
        await new Promise(resolve => setTimeout(resolve, splashSequence[i].duration));
      }

      // Übergang zum Hauptspiel
      setGameState(GameState.RUNNING);
    };

    startSequence();
  });



  // 1. Splash Animation (Verblassen + leichtes Skalieren für mehr "Playfulness")
  function splashAnim(node: HTMLElement) {
    // Initial unsichtbar, um Flackern zu vermeiden
    node.style.opacity = '0';
    animate(
      node,
      { opacity: [0, 1, 1, 0], scale: [0.95, 1, 1, 1] },
      { duration: 2.5, times: [0, 0.15, 0.85, 1], ease: 'easeInOut' }
    );
  }

  // 2. Circle Reveal: Öffnet das Spielfeld aus der Mitte heraus
  function circleReveal(node: HTMLElement, isRunning: () => boolean) {
    $effect(() => {
      if (isRunning()) {
        // Der Kreis öffnet sich bis auf 150%, um auch die Ecken des Bildschirms auszufüllen
        animate(
          node,
          { clipPath: ['circle(0% at 50% 50%)', 'circle(150% at 50% 50%)'] },
          { duration: 4.2, ease: [0.22, 1, 0.36, 1] } // Schöne "snappy" easing Kurve
        );
      } else {
        // Solange das Spiel nicht RUNNING ist, halten wir das weiße Feld zu (0%)
        node.style.clipPath = 'circle(0% at 50% 50%)';
      }
    });
  }
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
    <div class="absolute inset-0 bg-black flex items-center justify-center z-50">
      {#key currentSplashIndex}
        <img 
          use:splashAnim
          src={splashSequence[currentSplashIndex]?.src} 
          alt="Splash Logo" 
          class="absolute max-w-sm h-auto"
        />
      {/key}
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