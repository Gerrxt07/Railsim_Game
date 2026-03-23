<script lang="ts">
  import { GameState, setGameState } from '../state/game.svelte';
  import { menuItemAnim } from '../actions/animations.svelte';
  import { animate } from 'motion';

  // Prevent multiple clicks during transition
  let isNavigating = $state(false);

  const startGame = async () => {
    if (isNavigating) return;
    isNavigating = true;

    // Fade out menu points
    animate('.menu-item', { opacity: 0, scale: 0.95 }, { duration: 0.5, ease: 'easeOut' });

    // Move title up completely out of view
    await animate('.main-title', { y: -300, opacity: 0 }, { duration: 0.5, ease: 'easeIn' }).finished;

    setGameState(GameState.LOADING);
  };

  const menuItems = [
    { label: 'Spielen', colorClass: 'hover:text-green-500', action: startGame },
    { label: 'Settings', colorClass: 'hover:text-blue-500', action: () => console.log('Settings clicked') },
    { label: 'Verlassen', colorClass: 'hover:text-red-500', action: () => window.appControl?.quit() }
  ];
</script>

<div class="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
  <h1 
    use:menuItemAnim={-2}
    class="main-title text-[5rem] text-black absolute top-[15vh] tracking-widest drop-shadow-sm" 
    style="font-family: 'Press Start 2P', cursive;"
  >
    Railsim
  </h1>

  <div class="flex flex-col items-center space-y-10 pointer-events-auto mt-[40vh]">
    {#each menuItems as item, index}
      <button 
        use:menuItemAnim={index}
        onclick={item.action}
        disabled={isNavigating}
        class="menu-item text-4xl font-light tracking-[0.2em] text-slate-800 {item.colorClass} transition-colors duration-300 uppercase disabled:pointer-events-none"
      >
        {item.label}
      </button>
    {/each}
  </div>
</div>
