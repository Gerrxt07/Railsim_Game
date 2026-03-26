<script lang="ts">
  import { simState, setSimSpeed } from '../state/game.svelte';
  import { hoverBounce, tapPulse } from '../actions/animations.svelte';
  import { Pause } from 'lucide-svelte';

  const speedCycle = [0, 1, 2, 4];

  $effect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === 'Tab') {
        e.preventDefault(); // Prevent default focus switching
        const currentIndex = speedCycle.indexOf(simState.speed);
        const nextIndex = (currentIndex + 1) % speedCycle.length;
        setSimSpeed(speedCycle[nextIndex]);
      }
    };
    
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });
</script>

<div class="flex items-center bg-[#f4f4ec] dark:bg-[#c7c7be] border border-slate-300 dark:border-slate-400 rounded-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.05),0_4px_8px_-2px_rgba(0,0,0,0.1)] overflow-hidden h-10 relative">
  <!-- Subtle colored indicator at the bottom -->
  <div 
    class="absolute bottom-0 h-0.5 transition-all duration-300 pointer-events-none"
    style:width="2.5rem"
    style:transform="translateX({simState.speed === 0 ? 0 : simState.speed === 1 ? 2.5 : simState.speed === 2 ? 5.0 : 7.5}rem)"
    class:bg-red-500={simState.speed === 0}
    class:bg-green-500={simState.speed === 1}
    class:bg-blue-500={simState.speed === 2}
    class:bg-pink-500={simState.speed === 4}
  ></div>

  <button
    use:tapPulse
    class="w-10 h-full flex items-center justify-center border-r border-slate-200 dark:border-slate-400/50 hover:bg-black/5 transition-colors focus:outline-none cursor-pointer {simState.speed === 0 ? 'bg-red-100 dark:bg-red-900/20 shadow-inner' : ''}"
    onclick={() => setSimSpeed(0)}
    title="Pause"
    aria-label="Pause Simulation"
  >
      <Pause class="h-4 w-4 {simState.speed === 0 ? 'text-red-600 dark:text-red-500 scale-110' : 'text-slate-600 dark:text-slate-600 hover:text-slate-900'} transition-transform duration-300" fill="currentColor" strokeWidth={0} />
  </button>
  
  <button
    use:tapPulse
    class="w-10 h-full flex items-center justify-center border-r border-slate-200 dark:border-slate-400/50 hover:bg-black/5 transition-colors focus:outline-none cursor-pointer font-bold text-xs {simState.speed === 1 ? 'bg-green-100 dark:bg-green-900/20 shadow-inner text-green-700 dark:text-green-500 scale-110' : 'text-slate-600 hover:text-slate-900 dark:text-slate-700 dark:hover:text-slate-900'}"
    onclick={() => setSimSpeed(1)}
    title="Normal Speed (1x)"
  >
    1x
  </button>

  <button
    use:tapPulse
    class="w-10 h-full flex items-center justify-center border-r border-slate-200 dark:border-slate-400/50 hover:bg-black/5 transition-colors focus:outline-none cursor-pointer font-bold text-xs {simState.speed === 2 ? 'bg-blue-100 dark:bg-blue-900/20 shadow-inner text-blue-700 dark:text-blue-500 scale-110' : 'text-slate-600 hover:text-slate-900 dark:text-slate-700 dark:hover:text-slate-900'}"
    onclick={() => setSimSpeed(2)}
    title="Fast Speed (2x)"
  >
    2x
  </button>

  <button
    use:tapPulse
    class="w-10 h-full flex items-center justify-center hover:bg-black/5 transition-colors focus:outline-none cursor-pointer font-bold text-xs {simState.speed === 4 ? 'bg-pink-100 dark:bg-pink-900/20 shadow-inner text-pink-700 dark:text-pink-500 scale-110' : 'text-slate-600 hover:text-slate-900 dark:text-slate-700 dark:hover:text-slate-900'}"
    onclick={() => setSimSpeed(4)}
    title="Very Fast Speed (4x)"
  >
    4x
  </button>
</div>