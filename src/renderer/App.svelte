<script lang="ts">
  import { editorState, setMode, setTool } from './state/editor.svelte';
  import { networkState } from './state/network.svelte';

  // Raster-Einstellungen
  const gridSize = 40; // Abstand zwischen den Punkten in Pixeln
  const dotRadius = 1.5; // Größe der Punkte

  /**
   * Wir erstellen uns einen benutzerdefinierten Mauszeiger (Zirkel) mit Schatten.
   * * Um den Schatten unterzubringen, haben wir die Größe des SVGs leicht von 20x20 auf 24x24 erhöht,
   * damit der Schatten nicht am Rand abgeschnitten wird. Der Hotspot liegt jetzt bei "12 12".
   * * Wir definieren im <defs> Bereich einen Schatten-Filter:
   * - <feDropShadow>: dx/dy="1" (Verschiebung), stdDeviation="1.5" (Unschärfe), flood-color (Farbe).
   * Dann wenden wir den Filter mit filter="url(%23shadow)" auf den Kreis an.
   */
  const circleCursor = `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cdefs%3E%3Cfilter id='shadow'%3E%3CfeDropShadow dx='1' dy='1' stdDeviation='1.5' flood-color='rgba(0,0,0,0.3)' /%3E%3C/filter%3E%3C/defs%3E%3Ccircle cx='12' cy='12' r='5' stroke='%2394a3b8' stroke-width='1.5' fill='none' filter='url(%23shadow)' /%3E%3C/svg%3E") 12 12, crosshair`;
</script>

<main class="w-screen h-screen bg-[#f4f4ec] overflow-hidden relative text-slate-900">
  
  <svg 
    class="w-full h-full" 
    style="cursor: {circleCursor}"
  >
    
    <defs>
      <pattern 
        id="dot-grid" 
        width={gridSize} 
        height={gridSize} 
        patternUnits="userSpaceOnUse"
      >
        <circle 
          cx={gridSize / 2} 
          cy={gridSize / 2} 
          r={dotRadius} 
          class="fill-slate-300" 
        />
      </pattern>
    </defs>

    <rect width="100%" height="100%" fill="url(#dot-grid)" />
    
    <g id="network-layer">
      </g>

  </svg>

</main>