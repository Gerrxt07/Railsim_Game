import { animate } from 'motion';

// 1. Splash Animation (Verblassen + leichtes Skalieren)
export function splashAnim(node: HTMLElement) {
  // Initial unsichtbar, um Flackern zu vermeiden
  node.style.opacity = '0';
  animate(
    node,
    { opacity: [0, 1, 1, 0], scale: [0.95, 1, 1, 1.05] },
    { duration: 2.5, times: [0, 0.15, 0.85, 1], ease: 'easeInOut' }
  );
}

// 2. Circle Reveal: Öffnet das Spielfeld aus der Mitte heraus
export function circleReveal(node: HTMLElement, isRunning: () => boolean) {
  let hasRevealed = false;

  // Svelte 5 $effect reagiert automatisch auf Änderungen von isRunning()
  $effect(() => {
    if (isRunning()) {
      if (!hasRevealed) {
        hasRevealed = true;
        animate(
          node,
          { clipPath: ['circle(0% at 50% 50%)', 'circle(150% at 50% 50%)'] },
          { duration: 4.2, ease: [0.22, 1, 0.36, 1] }
        );
      }
    } else {
      hasRevealed = false;
      node.style.clipPath = 'circle(0% at 50% 50%)';
    }
  });
}

// 3. Main Menu Item Reveal
export function menuItemAnim(node: HTMLElement, options: { index: number, skipDelay: boolean }) {
  node.style.opacity = '0';
  node.style.transform = 'translateY(20px)';
  const baseDelay = options.skipDelay ? 0 : 1.5;
  animate(
    node,
    { opacity: [0, 1], y: [20, 0] },
    { duration: 1.2, delay: baseDelay + options.index * 0.25, ease: 'easeOut' }
  );
}

// 4. Hover Micro-animation (Elastic Scale)
export function hoverBounce(node: HTMLElement) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEnter = () => animate(node as any, { scale: 1.05 }, { type: 'spring', stiffness: 300, damping: 15 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onLeave = () => animate(node as any, { scale: 1 }, { type: 'spring', stiffness: 300, damping: 15 });
  
  node.addEventListener('mouseenter', onEnter);
  node.addEventListener('mouseleave', onLeave);
  
  return {
    destroy() {
      node.removeEventListener('mouseenter', onEnter);
      node.removeEventListener('mouseleave', onLeave);
    }
  };
}

// 5. Click Pulse Micro-animation
export function tapPulse(node: HTMLElement) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onMouseDown = () => animate(node as any, { scale: 0.92 }, { duration: 0.1 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onMouseUp = () => animate(node as any, { scale: 1 }, { type: 'spring', stiffness: 400, damping: 10 });
  
  node.addEventListener('mousedown', onMouseDown);
  node.addEventListener('mouseup', onMouseUp);
  node.addEventListener('mouseleave', onMouseUp);
  
  return {
    destroy() {
      node.removeEventListener('mousedown', onMouseDown);
      node.removeEventListener('mouseup', onMouseUp);
      node.removeEventListener('mouseleave', onMouseUp);
    }
  };
}