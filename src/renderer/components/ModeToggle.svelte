<script lang="ts">
  import { editorState, setMode } from '../state/editor.svelte';
  import { t } from '../state/i18n.svelte';
  import { fly } from 'svelte/transition';

  // Handles toggle via click
  const toggleMode = () => {
    setMode(editorState.mode === 'BUILD' ? 'DISPATCH' : 'BUILD');
  };

  // Keyboard shortcut listener (optional, but requested implicitly via "1 & 2")
  $effect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') setMode('BUILD');
      if (e.key === '2') setMode('DISPATCH');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });
</script>

<button
  class="relative flex items-center justify-center w-36 h-10 rounded-full bg-[#f4f4ec] dark:bg-[#c7c7be] border border-slate-300 dark:border-slate-400 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.05),0_4px_8px_-2px_rgba(0,0,0,0.1)] transition-all duration-300 hover:shadow-[inset_0_-2px_4px_rgba(0,0,0,0.05),0_6px_12px_-2px_rgba(0,0,0,0.15)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-px cursor-pointer focus:outline-none overflow-hidden"
  onclick={toggleMode}
>
  <!-- Subtle colored background indicator that slides from the bottom -->
  <div 
    class="absolute bottom-0 w-full h-0.75 transition-colors duration-500 {editorState.mode === 'BUILD' ? 'bg-teal-500' : 'bg-purple-500'}"
  ></div>

  <div class="absolute inset-0 flex items-center justify-center transition-colors duration-300">
    {#key editorState.mode}
      <div 
        class="absolute flex items-center justify-center w-full"
        in:fly={{ y: -15, duration: 250, delay: 100 }} 
        out:fly={{ y: 15, duration: 250 }}
      >
        <span 
          class="font-black tracking-widest text-[11px] uppercase {editorState.mode === 'BUILD' ? 'text-teal-600' : 'text-purple-600'}"
        >
          {editorState.mode === 'BUILD' ? t('mode.build') : t('mode.dispatch')}
        </span>
      </div>
    {/key}
  </div>
</button>
