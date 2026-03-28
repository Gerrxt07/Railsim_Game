<script lang="ts">
  import type { Position, TrackType } from '../game/model/network';

  interface Props {
    startPos: Position | null;
    endPos: Position | null;
    trackType: TrackType;
  }

  let { startPos, endPos, trackType }: Props = $props();

  const pathD = $derived.by(() => {
    if (!startPos || !endPos) return '';
    if (trackType !== 'curve') {
      return `M ${startPos.x} ${startPos.y} L ${endPos.x} ${endPos.y}`;
    }

    const dx = endPos.x - startPos.x;
    const dy = endPos.y - startPos.y;
    const midX = (startPos.x + endPos.x) / 2;
    const midY = (startPos.y + endPos.y) / 2;
    const len = Math.max(1, Math.hypot(dx, dy));
    const normalX = -dy / len;
    const normalY = dx / len;
    const curveOffset = Math.min(42, len * 0.35);
    const controlX = midX + normalX * curveOffset;
    const controlY = midY + normalY * curveOffset;

    return `M ${startPos.x} ${startPos.y} Q ${controlX} ${controlY} ${endPos.x} ${endPos.y}`;
  });

  const switchMarker = $derived.by(() => {
    if (!startPos || !endPos || trackType !== 'switch') return null;
    const dx = endPos.x - startPos.x;
    const dy = endPos.y - startPos.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    return {
      x: startPos.x + (dx / len) * 18,
      y: startPos.y + (dy / len) * 18
    };
  });
</script>

{#if startPos && endPos}
  <g class="pointer-events-none">
    <path
      d={pathD}
      class="stroke-cyan-500/95 dark:stroke-cyan-300/95"
      stroke-width="2"
      stroke-linecap="round"
      fill="none"
      stroke-dasharray="8 5"
      vector-effect="non-scaling-stroke"
    />
    <circle
      cx={startPos.x}
      cy={startPos.y}
      r="5"
      class="fill-cyan-500/25 stroke-cyan-600 dark:fill-cyan-300/20 dark:stroke-cyan-200"
      stroke-width="1.5"
      vector-effect="non-scaling-stroke"
    />
    <circle
      cx={endPos.x}
      cy={endPos.y}
      r="5"
      class="fill-cyan-500/25 stroke-cyan-600 dark:fill-cyan-300/20 dark:stroke-cyan-200"
      stroke-width="1.5"
      vector-effect="non-scaling-stroke"
    />
    {#if switchMarker}
      <circle
        cx={switchMarker.x}
        cy={switchMarker.y}
        r="2.5"
        class="fill-amber-400 stroke-amber-500 dark:fill-amber-300 dark:stroke-amber-200"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
      />
    {/if}
  </g>
{/if}
