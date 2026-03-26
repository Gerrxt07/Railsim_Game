<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import { editorState, setTool, toggleOverlay, type EditorTool, type OverlayType } from '../state/editor.svelte';
  import { hoverBounce, tapPulse } from '../actions/animations.svelte';
  import { t } from '../state/i18n.svelte';
  import { 
    MousePointer2, BoxSelect, MousePointerSquareDashed,
    TrainTrack, TrainFront, TrafficCone, Warehouse,
    Trash2, Move, Scissors, Merge, Replace,
    Hash, Waypoints, Network, Route, ShieldAlert, TextQuote,
    Compass, Hammer, Wrench, Activity
  } from 'lucide-svelte';

  const categories = $derived([
    {
      name: 'navigation',
      categoryIcon: Compass,
      isOverlayCategory: false,
      tools: [
        { id: 'SELECT', label: 'select', icon: MousePointer2 },
        { id: 'MULTISELECT', label: 'multiselect', icon: BoxSelect },
        { id: 'INSPECT', label: 'inspect', icon: MousePointerSquareDashed },
      ]
    },
    {
      name: 'infrastructure',
      categoryIcon: Hammer,
      isOverlayCategory: false,
      tools: [
        { id: 'TRACK', label: 'track', icon: TrainTrack },
        { id: 'STATION', label: 'station', icon: TrainFront },
        { id: 'SIGNAL', label: 'signal', icon: TrafficCone },
        { id: 'DEPOT', label: 'depot', icon: Warehouse },
      ]
    },
    {
      name: 'maintenance',
      categoryIcon: Wrench,
      isOverlayCategory: false,
      tools: [
        { id: 'DELETE', label: 'delete', icon: Trash2 },
        { id: 'MOVE', label: 'move', icon: Move },
        { id: 'SPLIT', label: 'split', icon: Scissors },
        { id: 'MERGE', label: 'merge', icon: Merge },
        { id: 'REPLACE', label: 'replace', icon: Replace },
      ]
    },
    {
      name: 'analysis',
      categoryIcon: Activity,
      isOverlayCategory: true,
      tools: [
        { id: 'SHOW_TRACK_ID', label: 'show_track_id', icon: Hash },
        { id: 'SHOW_NODE_ID', label: 'show_node_id', icon: Waypoints },
        { id: 'BLOCK_OVERLAY', label: 'block_overlay', icon: Network },
        { id: 'SIGNAL_INFO', label: 'signal_info', icon: TextQuote },
        { id: 'PATH_PREVIEW', label: 'path_preview', icon: Route },
        { id: 'VALIDATION_OVERLAY', label: 'validation_overlay', icon: ShieldAlert },
      ]
    }
  ]);

  let hoveredCategory: string | null = $state(null);

  function selectTool(id: string) {
    setTool(id as EditorTool);
  }
</script>

{#if editorState.mode === 'BUILD'}
  <div 
    class="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-auto flex z-30"
    in:fly={{ x: -100, opacity: 0, duration: 600, delay: 200, easing: backOut }}
    out:fly={{ x: -100, opacity: 0, duration: 400 }}
  >
    <div class="bg-[#f4f4ec] dark:bg-[#c7c7be] rounded-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.05),0_4px_8px_-2px_rgba(0,0,0,0.1)] border border-slate-300 dark:border-slate-400 p-2 flex flex-col gap-3">
      {#each categories as category}
        {@const CategoryIcon = category.categoryIcon}
        {@const isActiveCategory = category.isOverlayCategory 
          ? category.tools.some(t => editorState.activeOverlays.includes(t.id as OverlayType))
          : category.tools.some(t => t.id === editorState.activeTool)}
        
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
          class="relative flex items-center justify-center group"
          onmouseenter={() => hoveredCategory = category.name}
          onmouseleave={() => hoveredCategory = null}
        >
          <!-- Main Category Pill Icon -->
          <button 
            use:hoverBounce
            use:tapPulse
            class="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 outline-none hover:bg-black/5 dark:hover:bg-black/10 focus:outline-none
                   {isActiveCategory
                     ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-700 shadow-inner' 
                     : 'text-slate-600 dark:text-slate-600 hover:text-slate-900 dark:hover:text-slate-900'}"
            aria-label="{category.name} Tools"
          >
            <CategoryIcon size={isActiveCategory ? 26 : 24} strokeWidth={isActiveCategory ? 2 : 1.5} class="transition-all duration-200" />
          </button>

          <!-- Popout Tooltip Menu -->
          {#if hoveredCategory === category.name}
            <!-- Wrapper with pl-4 padding to bridge the hover gap seamlessly -->
            <div 
              class="absolute left-full top-1/2 -translate-y-1/2 pl-4 py-8 pointer-events-auto"
              in:fly={{ x: -10, opacity: 0, duration: 250, easing: backOut }}
              out:fade={{ duration: 150 }}
            >
              <div class="bg-[#f4f4ec] dark:bg-[#c7c7be] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-300 dark:border-slate-400 w-64 overflow-visible flex flex-col p-1.5 relative z-40">
                
                <!-- Tooltip pointer arrow -->
                <div class="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#f4f4ec] dark:bg-[#c7c7be] border-l border-b border-slate-300 dark:border-slate-400 rotate-45 z-[-1] rounded-sm"></div>
                
                <div class="px-3 py-1.5 text-xs font-bold text-slate-500/80 dark:text-slate-600/80 mb-1 border-b border-slate-200 dark:border-slate-400/30 uppercase tracking-wider">
                  {t(`toolbar.category.${category.name}` as Parameters<typeof t>[0])}
                </div>
                
                <div class="flex flex-col gap-0.5">
                  {#each category.tools as tool}
                    {@const Icon = tool.icon}
                    {@const isActiveNode = category.isOverlayCategory 
                            ? editorState.activeOverlays.includes(tool.id as OverlayType)
                            : editorState.activeTool === tool.id}
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button
                      use:tapPulse
                      class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-all duration-200 relative focus:outline-none cursor-pointer
                             {isActiveNode 
                               ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-700 font-medium shadow-inner' 
                               : 'text-slate-600 hover:bg-black/5 dark:text-slate-700 dark:hover:bg-black/10 hover:text-slate-900 dark:hover:text-slate-900'}"
                      onclick={() => category.isOverlayCategory ? toggleOverlay(tool.id as OverlayType) : selectTool(tool.id)}
                    >
                      <Icon size={18} strokeWidth={isActiveNode ? 2 : 1.5} />
                      <span class="truncate">{t(`toolbar.tool.${tool.label}` as Parameters<typeof t>[0])}</span>
                      
                      {#if isActiveNode}
                        <div class="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-full" in:fade={{duration: 200}}></div>
                      {/if}
                    </button>
                  {/each}
                </div>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/if}