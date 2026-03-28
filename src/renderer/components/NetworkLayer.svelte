<script lang="ts">
  import { networkStore } from '../state/network.svelte';
  import type { Position } from '../game/model/network';

  const tracks = $derived(Object.values(networkStore.current.tracks));
  const nodes = $derived(Object.values(networkStore.current.nodes));

  function linePath(start: Position, end: Position): string {
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }

  function curvePath(start: Position, control: Position, end: Position): string {
    return `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;
  }

  function getSwitchMarker(start: Position, end: Position): Position {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    return {
      x: start.x + (dx / len) * 18,
      y: start.y + (dy / len) * 18
    };
  }
</script>

<g class="pointer-events-none">
  {#each tracks as track (track.id)}
    {@const startNode = networkStore.current.nodes[track.nodes[0]]}
    {@const endNode = networkStore.current.nodes[track.nodes[track.nodes.length - 1]]}
    {#if startNode && endNode}
      {@const mainPath = track.type === 'curve' && track.controlPoint
        ? curvePath(startNode.position, track.controlPoint, endNode.position)
        : linePath(startNode.position, endNode.position)}
      <path
        d={mainPath}
        class="stroke-slate-800/85 dark:stroke-slate-900"
        stroke-width="4"
        stroke-linecap="round"
        fill="none"
        vector-effect="non-scaling-stroke"
      />
      <path
        d={mainPath}
        class="stroke-cyan-400/80 dark:stroke-cyan-300/75"
        stroke-width="1.4"
        stroke-linecap="round"
        fill="none"
        stroke-dasharray="10 7"
        vector-effect="non-scaling-stroke"
      />

      {#if track.type === 'switch'}
        {@const switchMarker = getSwitchMarker(startNode.position, endNode.position)}
        <circle
          cx={switchMarker.x}
          cy={switchMarker.y}
          r="2.6"
          class="fill-amber-400 stroke-amber-500 dark:fill-amber-300 dark:stroke-amber-200"
          stroke-width="1"
          vector-effect="non-scaling-stroke"
        />
      {/if}
    {/if}
  {/each}

  {#each nodes as node (node.id)}
    <circle
      cx={node.position.x}
      cy={node.position.y}
      r="4"
      class="fill-slate-700 dark:fill-slate-800"
      vector-effect="non-scaling-stroke"
    />
    <circle
      cx={node.position.x}
      cy={node.position.y}
      r="2"
      class="fill-cyan-300 dark:fill-cyan-200"
      vector-effect="non-scaling-stroke"
    />
  {/each}
</g>
