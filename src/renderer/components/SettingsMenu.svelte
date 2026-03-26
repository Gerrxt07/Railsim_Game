<script lang="ts">
  import { uiState, toggleSettings, setTheme, setLanguage } from '../state/game.svelte';
  import { hoverBounce, tapPulse } from '../actions/animations.svelte';
  import { debugStore, toggleConsole, setConsoleHotkey } from '../state/debug.svelte';
  import { t } from '../state/i18n.svelte';
  import { fly, fade } from 'svelte/transition';
  import { X } from 'lucide-svelte';
  
  import flagDE from '../../assets/content/Flag_of_germany.png';
  import flagEN from '../../assets/content/Flag_of_the_United_Kingdom.png';
</script>

{#if uiState.isSettingsOpen}
  <!-- Backdrop -->
  <div 
    class="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity"
    in:fade={{ duration: 300 }}
    out:fade={{ duration: 300, delay: 200 }}
    onclick={() => toggleSettings(false)}
    aria-hidden="true"
  ></div>

  <!-- Sidebar -->
  <div 
    class="absolute top-0 right-0 bottom-0 z-50 w-96 bg-[#f4f4ec] dark:bg-[#c7c7be] shadow-2xl border-l border-slate-300 dark:border-slate-400 flex flex-col pointer-events-auto transition-colors duration-500"
    in:fly={{ x: '100%', duration: 400, opacity: 1, easing: (t) => 1 - Math.pow(1 - t, 4) }}
    out:fly={{ x: '100%', duration: 400, opacity: 1, easing: (t) => 1 - Math.pow(1 - t, 4) }}
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-8 py-8 border-b border-slate-200 dark:border-slate-400">
      <h2 class="text-2xl font-light tracking-widest text-slate-800 uppercase">{t('settings.title')}</h2>
      <button 
        use:hoverBounce
        use:tapPulse
        class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 text-slate-500 dark:text-slate-600 hover:text-black dark:hover:text-black transition-colors focus:outline-none"
        onclick={() => toggleSettings(false)}
        aria-label="Close settings"
      >
        <X class="h-6 w-6" strokeWidth={1.5} />
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-8 flex flex-col gap-8 text-slate-600 dark:text-slate-800">

      <!-- Language -->
      <section>
        <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">{t('settings.language')}</h3>
        <div class="flex gap-4">
          <button 
            use:hoverBounce
            use:tapPulse
            class="flex-1 flex items-center justify-center py-2 px-4 rounded-lg border transition-all duration-300 focus:outline-none cursor-pointer
              {uiState.language === 'en' ? 'bg-slate-200 dark:bg-slate-300 border-slate-400 shadow-inner' : 'bg-transparent border-slate-200 dark:border-slate-400 hover:bg-slate-100 dark:hover:bg-[#d0d0c8]'}"
            onclick={() => setLanguage('en')}
          >
            <img src={flagEN} alt="English" title="English" class="w-8 h-auto shadow-sm rounded-sm" />
          </button>
          <button 
            use:hoverBounce
            use:tapPulse
            class="flex-1 flex items-center justify-center py-2 px-4 rounded-lg border transition-all duration-300 focus:outline-none cursor-pointer
              {uiState.language === 'de' ? 'bg-slate-200 dark:bg-slate-300 border-slate-400 shadow-inner' : 'bg-transparent border-slate-200 dark:border-slate-400 hover:bg-slate-100 dark:hover:bg-[#d0d0c8]'}"
            onclick={() => setLanguage('de')}
          >
            <img src={flagDE} alt="Deutsch" title="Deutsch" class="w-8 h-auto shadow-sm rounded-sm" />
          </button>
        </div>
      </section>

      <!-- Appearance -->
      <section>
        <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">{t('settings.appearance')}</h3>
        <div class="space-y-4">
          <button 
            use:tapPulse
            class="w-full flex items-center justify-between group cursor-pointer focus:outline-none"
            onclick={() => setTheme(uiState.theme === 'light' ? 'dark' : 'light')}
          >
            <span class="group-hover:text-slate-900 transition-colors">{t('settings.eyeFriendly')}</span>
            <div class="w-10 h-5 rounded-full relative shadow-inner transition-colors duration-300 {uiState.theme === 'dark' ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}">
              <div class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 {uiState.theme === 'dark' ? 'right-0.5' : 'left-0.5'}"></div>
            </div>
          </button>

          <button 
            use:tapPulse
            class="w-full flex items-center justify-between group cursor-pointer focus:outline-none"
            onclick={() => import('../state/game.svelte').then(m => m.toggleSpeedPopups())}
          >
            <span class="group-hover:text-slate-900 transition-colors">{t('settings.showSpeedPopups')}</span>
            <div class="w-10 h-5 rounded-full relative shadow-inner transition-colors duration-300 {uiState.showSpeedPopups ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}">
              <div class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 {uiState.showSpeedPopups ? 'right-0.5' : 'left-0.5'}"></div>
            </div>
          </button>
        </div>
      </section>
      
      <!-- Debug -->
      <section>
        <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">{t('settings.developer')}</h3>
        <div class="space-y-4">
          <div class="relative group">
            <button class="w-full flex items-center justify-between cursor-not-allowed opacity-50" disabled>
              <span class="transition-colors">{t('settings.showDebugGrid')}</span>
              <div class="w-10 h-5 bg-slate-300 dark:bg-slate-400 rounded-full relative shadow-inner">
                <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow"></div>
              </div>
            </button>
            <div class="absolute top-1/2 -translate-y-1/2 right-12 z-50 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap pointer-events-none shadow-lg border border-slate-700 tracking-widest uppercase font-bold">
              {t('playmenu.wip' as Parameters<typeof t>[0])}
            </div>
          </div>
          
          <button 
            use:tapPulse
            class="w-full flex items-center justify-between group cursor-pointer focus:outline-none"
            onclick={() => toggleConsole()}
          >
            <span class="group-hover:text-slate-900 transition-colors">{t('settings.consoleEnabled')}</span>
            <div class="w-10 h-5 rounded-full relative shadow-inner transition-colors duration-300 {debugStore.consoleEnabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}">
              <div class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 {debugStore.consoleEnabled ? 'right-0.5' : 'left-0.5'}"></div>
            </div>
          </button>

          <div class="w-full flex items-center justify-between">
            <span class="text-slate-600 dark:text-slate-800 transition-colors">{t('settings.consoleHotkey')}</span>
            <div class="relative flex items-center">
              <input 
                use:hoverBounce
                type="text" 
                maxlength="1" 
                class="w-10 h-8 text-center bg-slate-200 dark:bg-slate-300 border border-slate-400 shadow-inner rounded-md text-slate-900 font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer uppercase text-lg"
                value={debugStore.consoleHotkey}
                onkeydown={(e) => {
                  e.preventDefault();
                  if (e.key.length === 1) {
                    setConsoleHotkey(e.key.toLowerCase());
                    e.currentTarget.blur();
                  }
                }}
                title="Click and press a key"
                readonly
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Other -->
      <section>
        <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">{t('settings.other')}</h3>
        <div class="space-y-4">
          <button 
            use:tapPulse
            class="w-full flex items-center justify-between group cursor-pointer focus:outline-none"
            onclick={() => {
              toggleSettings(false);
              uiState.showTutorial = true;
            }}
          >
            <span class="group-hover:text-slate-900 transition-colors">{t('settings.showTutorial')}</span>
            <div class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md text-xs font-bold uppercase tracking-wider group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
              Open
            </div>
          </button>
        </div>
      </section>

      <!-- System -->
      <section class="mt-auto pt-8 border-t border-slate-200 dark:border-slate-400/50 flex flex-col gap-6">
        <div class="w-full flex flex-col gap-2 relative group text-center">
          <span class="text-slate-600 dark:text-slate-800 transition-colors opacity-50 font-bold tracking-wide text-center">{t('settings.liveKey' as Parameters<typeof t>[0])}</span>
          <div class="relative flex items-center opacity-50 justify-center w-full">
            <input 
              type="password" 
              class="w-full text-center h-10 px-3 bg-slate-100 dark:bg-slate-200 border border-slate-300 dark:border-slate-400 shadow-inner rounded-lg text-slate-900 focus:outline-none cursor-not-allowed text-sm font-mono tracking-widest"
              value="live_xxx_xxxxxxxxxxxx"
              disabled
            />
          </div>
          <div class="absolute top-1/2 -translate-y-1/2 right-4 z-50 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap pointer-events-none shadow-lg border border-slate-700 tracking-widest uppercase font-bold">
            {t('playmenu.wip' as Parameters<typeof t>[0])}
          </div>
        </div>

        <button 
          use:hoverBounce
          use:tapPulse
          class="w-full flex items-center justify-center p-3 rounded-lg border border-red-200 dark:border-red-300/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 transition-all duration-300 font-semibold uppercase tracking-widest text-sm"
          onclick={() => {
            toggleSettings(false);
            import('../state/game.svelte').then(m => m.setGameState(m.GameState.MAIN_MENU));
          }}
        >
          {t('settings.backToMenu')}
        </button>
      </section>

    </div>
  </div>
{/if}
