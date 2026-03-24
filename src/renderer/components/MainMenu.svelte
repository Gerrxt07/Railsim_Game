<script lang="ts">
  import { GameState, setGameState, uiState } from '../state/game.svelte';
  import { t } from '../state/i18n.svelte';
  import { menuItemAnim } from '../actions/animations.svelte';
  import { animate } from 'motion';
  import { fade } from 'svelte/transition';
  import { Trash2 } from 'lucide-svelte';
  import stripsImg from '../../assets/content/Strips.png';

  // State
  let isNavigating = $state(false);
  let activeMenu = $state<'main' | 'play' | 'new_game' | 'load_game' | 'delete_save'>('main');
  let saves = $state<any[]>([]);
  let playerName = $state('');
  let loadingSaves = $state(false);

  // Transitions & actions
  const fetchSaves = async () => {
    loadingSaves = true;
    try {
      saves = (await window.electronAPI?.listSaves()) || [];
    } finally {
      loadingSaves = false;
    }
  };

  const navTo = (menu: typeof activeMenu) => {
    if (menu !== 'main') fetchSaves();
    activeMenu = menu;
  };

  const startGameTransition = async () => {
    if (isNavigating) return;
    isNavigating = true;

    animate('.menu-item', { opacity: 0, scale: 0.95 }, { duration: 0.5, ease: 'easeOut' });
    await animate('.main-title', { y: -300, opacity: 0 }, { duration: 0.5, ease: 'easeIn' }).finished;
    
    uiState.hasPlayedIntro = true;
    setGameState(GameState.RUNNING);
  };

  const createGame = async () => {
    if (!playerName.trim()) return;
    const res = await window.electronAPI?.createSave(playerName.trim());
    if (res?.ok) {
      startGameTransition(); // start newly created game
    }
  };

  const loadSave = async (filename: string) => {
    const res = await window.electronAPI?.loadSave(filename);
    if (res?.ok) {
      // TODO set data to game store
      startGameTransition();
    }
  };

  const deleteSave = async (filename: string) => {
    await window.electronAPI?.deleteSave(filename);
    fetchSaves();
  };

</script>

<div class="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none" in:fade={{ duration: 600 }}>
  <div 
    use:menuItemAnim={{ index: -2, skipDelay: uiState.hasPlayedIntro }}
    class="main-title absolute top-[15vh] flex items-center justify-center gap-6"
  >
    <h1 class="text-[5rem] text-black tracking-widest drop-shadow-sm" style="font-family: 'Press Start 2P', cursive;">Railsim</h1>
    <img src={stripsImg} alt="Decal Strips" class="h-20 w-auto opacity-90 drop-shadow-sm" />
  </div>

  <div class="flex flex-col items-center space-y-10 pointer-events-auto mt-[30vh]">
    {#if activeMenu === 'main'}
      <button use:menuItemAnim={{ index: 0, skipDelay: uiState.hasPlayedIntro }} onclick={() => navTo('play')} disabled={isNavigating} class="menu-item text-4xl font-light tracking-[0.2em] text-slate-800 hover:text-green-500 transition-colors duration-300 uppercase disabled:pointer-events-none">{t('menu.play')}</button>
      <button use:menuItemAnim={{ index: 1, skipDelay: uiState.hasPlayedIntro }} onclick={() => { import('../state/game.svelte').then(m => m.toggleSettings(true)) }} disabled={isNavigating} class="menu-item text-4xl font-light tracking-[0.2em] text-slate-800 hover:text-blue-500 transition-colors duration-300 uppercase disabled:pointer-events-none">{t('menu.settings')}</button>
      <button use:menuItemAnim={{ index: 2, skipDelay: uiState.hasPlayedIntro }} onclick={() => window.appControl?.quit()} disabled={isNavigating} class="menu-item text-4xl font-light tracking-[0.2em] text-slate-800 hover:text-red-500 transition-colors duration-300 uppercase disabled:pointer-events-none">{t('menu.quit')}</button>
    
    {:else if activeMenu === 'play'}
      <button in:fade onclick={() => navTo('new_game')} class="menu-item text-3xl font-light tracking-[0.2em] text-slate-800 hover:text-green-500 transition-colors uppercase">{t('playmenu.newGame')}</button>
      <button in:fade onclick={() => navTo('load_game')} class="menu-item text-3xl font-light tracking-[0.2em] transition-colors uppercase {saves.length === 0 ? 'text-slate-400 cursor-not-allowed' : 'text-slate-800 hover:text-yellow-600'}" disabled={saves.length === 0}>{t('playmenu.loadGame')}</button>
      <button in:fade onclick={() => navTo('delete_save')} class="menu-item text-3xl font-light tracking-[0.2em] transition-colors uppercase {saves.length === 0 ? 'text-slate-400 cursor-not-allowed' : 'text-slate-800 hover:text-red-500'}" disabled={saves.length === 0}>{t('playmenu.deleteSave')}</button>
      <button in:fade onclick={() => navTo('main')} class="menu-item text-xl mt-8 font-light tracking-[0.2em] text-slate-600 hover:text-slate-900 transition-colors uppercase">{t('playmenu.back')}</button>

    {:else if activeMenu === 'new_game'}
      <div in:fade class="flex flex-col items-center gap-6">
        <h2 class="text-2xl font-light tracking-widest text-slate-800 uppercase">{t('playmenu.newGame')}</h2>
        <input type="text" bind:value={playerName} placeholder={t('playmenu.enterName')} class="px-6 py-4 bg-white/50 border border-slate-300 rounded-xl shadow-inner text-xl focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-slate-400" />
        <div class="flex gap-4 mt-4">
          <button onclick={() => navTo('play')} class="px-6 py-2 text-slate-500 hover:text-slate-800 uppercase tracking-widest transition-colors">{t('playmenu.back')}</button>
          <button onclick={createGame} disabled={!playerName.trim()} class="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg shadow uppercase tracking-widest transition-all">{t('playmenu.start')}</button>
        </div>
      </div>

    {:else if activeMenu === 'load_game'}
      <div in:fade class="flex flex-col items-center gap-6 w-[600px] max-h-[50vh]">
        <h2 class="text-2xl font-light tracking-widest text-slate-800 uppercase">{t('playmenu.loadGame')}</h2>
        <div class="w-full flex-1 overflow-y-auto pr-2 space-y-3">
          {#each saves as save}
            <button onclick={() => loadSave(save.filename)} class="w-full flex justify-between items-center bg-white/60 hover:bg-white p-4 rounded-xl border border-slate-200 hover:border-yellow-400 transition-all shadow-sm text-left group">
              <div>
                <div class="font-semibold text-lg text-slate-800 group-hover:text-yellow-700">{save.playerName}</div>
                <div class="text-sm text-slate-500">{t('playmenu.lastPlayed')} {new Date(save.updatedAt).toLocaleString()}</div>
              </div>
            </button>
          {/each}
        </div>
        <button onclick={() => navTo('play')} class="px-6 py-2 mt-4 text-slate-500 hover:text-slate-800 uppercase tracking-widest transition-colors">{t('playmenu.back')}</button>
      </div>

    {:else if activeMenu === 'delete_save'}
      <div in:fade class="flex flex-col items-center gap-6 w-[600px] max-h-[50vh]">
        <h2 class="text-2xl font-light tracking-widest text-red-600 uppercase">{t('playmenu.deleteSave')}</h2>
        <div class="w-full flex-1 overflow-y-auto pr-2 space-y-3">
          {#each saves as save}
            <div class="w-full flex justify-between items-center bg-white/60 p-4 rounded-xl border border-slate-200 shadow-sm text-left">
              <div>
                <div class="font-semibold text-lg text-slate-800">{save.playerName}</div>
                <div class="text-sm text-slate-500">{new Date(save.updatedAt).toLocaleString()}</div>
              </div>
              <button onclick={() => deleteSave(save.filename)} class="p-2 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors" title="Delete">
                <Trash2 class="h-6 w-6" strokeWidth={2} />
              </button>
            </div>
          {/each}
        </div>
        <button onclick={() => navTo('play')} class="px-6 py-2 mt-4 text-slate-500 hover:text-slate-800 uppercase tracking-widest transition-colors">{t('playmenu.back')}</button>
      </div>

    {/if}
  </div>
</div>
