<script lang="ts">
  import { GameState, currentGameState, updateThemeClass, viewState } from './state/game.svelte';
  import { editorState } from './state/editor.svelte';
  import { circleReveal } from './actions/animations.svelte';
  import SplashScreen from './components/SplashScreen.svelte';
  import MainMenu from './components/MainMenu.svelte';
  import GameUI from './components/GameUI.svelte';
  import SettingsMenu from './components/SettingsMenu.svelte';
  import DeveloperConsole from './components/DeveloperConsole.svelte';
  import { toggleSettings } from './state/game.svelte';
  import { debugStore, toggleConsoleVisibility } from './state/debug.svelte';
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

  // Pan and Zoom logic
  let isDragging = $state(false);
  let dragStart = { x: 0, y: 0 };
  let viewStart = { x: 0, y: 0 };

  // Box Selection logic
  let isBoxSelecting = $state(false);
  let boxStart = $state({ x: 0, y: 0 });
  let boxCurrent = $state({ x: 0, y: 0 });

  function handlePointerDown(e: PointerEvent) {
    // Only apply in RUNNING state
    if (currentGameState.value !== GameState.RUNNING) return;
    
    // Right Mouse Button (2) or Middle Mouse Button (1)
    if (e.button === 1 || e.button === 2) { 
      isDragging = true;
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      dragStart = { x: e.clientX, y: e.clientY };
      viewStart = { x: viewState.x, y: viewState.y };
    } else if (e.button === 0 && editorState.mode === 'BUILD' && editorState.activeTool === 'MULTISELECT') {
      isBoxSelecting = true;
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      
      const worldX = (e.clientX - viewState.x) / viewState.zoom;
      const worldY = (e.clientY - viewState.y) / viewState.zoom;
      
      boxStart = { x: worldX, y: worldY };
      boxCurrent = { x: worldX, y: worldY };
    }
  }

  function handlePointerMove(e: PointerEvent) {
    if (isDragging) {
      viewState.x = viewStart.x + (e.clientX - dragStart.x);
      viewState.y = viewStart.y + (e.clientY - dragStart.y);
    } else if (isBoxSelecting) {
      const worldX = (e.clientX - viewState.x) / viewState.zoom;
      const worldY = (e.clientY - viewState.y) / viewState.zoom;
      boxCurrent = { x: worldX, y: worldY };
    }
  }

  function handlePointerUp(e: PointerEvent) {
    if (isDragging) {
      isDragging = false;
      (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    }
    if (isBoxSelecting) {
      isBoxSelecting = false;
      (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
      
      // Determine final selected area bounds in world coordinates
      // const minX = Math.min(boxStart.x, boxCurrent.x);
      // const maxX = Math.max(boxStart.x, boxCurrent.x);
      // const minY = Math.min(boxStart.y, boxCurrent.y);
      // const maxY = Math.max(boxStart.y, boxCurrent.y);
      // --> Trigger internal block/network selection logic here
    }
  }

  function handleWheel(e: WheelEvent) {
    if (currentGameState.value !== GameState.RUNNING) return;
    
    const zoomFactor = 1.1;
    const direction = e.deltaY < 0 ? 1 : -1;
    const newZoom = direction > 0 ? viewState.zoom * zoomFactor : viewState.zoom / zoomFactor;
    
    // Zoom limits
    if (newZoom < 0.2 || newZoom > 5) return;
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const dx = (mouseX - viewState.x) * (newZoom / viewState.zoom);
    const dy = (mouseY - viewState.y) * (newZoom / viewState.zoom);

    viewState.x = mouseX - dx;
    viewState.y = mouseY - dy;
    viewState.zoom = newZoom;
  }
  // Calculate dynamic radius based on zoom.
  // When zoomed out (< 1), increase the base radius so the dots stay visible
  let currentDotRadius = $derived(
    viewState.zoom < 1 ? dotRadius * (1 + (1 - viewState.zoom) * 1.5) : dotRadius
  );

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (debugStore.isConsoleOpen) {
        toggleConsoleVisibility();
      } else if (currentGameState.value === GameState.RUNNING) {
        toggleSettings();
      }
    } else if (e.key === debugStore.consoleHotkey) {
      e.preventDefault();
      toggleConsoleVisibility();
    }
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  class="w-screen h-screen bg-black relative select-none"
  oncontextmenu={(e) => e.preventDefault()}
>
  
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

    <svg 
      class="w-full h-full touch-none"
      onpointerdown={handlePointerDown}
      onpointermove={handlePointerMove}
      onpointerup={handlePointerUp}
      onpointercancel={handlePointerUp}
      onwheel={handleWheel}
    >
      <defs>
        <pattern id="dot-grid" x={viewState.x} y={viewState.y} width={gridSize * viewState.zoom} height={gridSize * viewState.zoom} patternUnits="userSpaceOnUse">
          <circle cx={(gridSize * viewState.zoom) / 2} cy={(gridSize * viewState.zoom) / 2} r={currentDotRadius * viewState.zoom} class="fill-slate-400/80 dark:fill-slate-500/80" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-grid)" />
      
      <g id="network-layer" transform="translate({viewState.x} {viewState.y}) scale({viewState.zoom})">
        </g>

      {#if isBoxSelecting && (Math.abs(boxCurrent.x - boxStart.x) > 1 || Math.abs(boxCurrent.y - boxStart.y) > 1)}
        <g transform="translate({viewState.x} {viewState.y}) scale({viewState.zoom})">
          <rect 
            x={Math.min(boxStart.x, boxCurrent.x)}
            y={Math.min(boxStart.y, boxCurrent.y)}
            width={Math.abs(boxCurrent.x - boxStart.x)}
            height={Math.abs(boxCurrent.y - boxStart.y)}
            class="fill-blue-500/10 stroke-blue-500 dark:fill-blue-400/10 dark:stroke-blue-400 outline-march"
            stroke-width="1.5"
            stroke-dasharray="6 4"
            vector-effect="non-scaling-stroke"
          />
        </g>
      {/if}
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

  <!-- Developer Console pill -->
  <DeveloperConsole />

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

  @keyframes march {
    to { stroke-dashoffset: -10; }
  }
  
  .outline-march {
    animation: march 0.6s linear infinite;
  }

  :global(:root) {
    --circleCursor: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cdefs%3E%3Cfilter id='shadow'%3E%3CfeDropShadow dx='1' dy='1' stdDeviation='1.5' flood-color='rgba(0,0,0,0.3)' /%3E%3C/filter%3E%3C/defs%3E%3Ccircle cx='12' cy='12' r='5' stroke='%2394a3b8' stroke-width='1.5' fill='none' filter='url(%23shadow)' /%3E%3C/svg%3E") 12 12, crosshair;
  }
</style>