import type { Position } from '../model/network';

const DEG_45 = Math.PI / 4;

export function snapToGrid(position: Position, gridSize: number): Position {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize
  };
}

export function snapTrackEndToDigitalLine(start: Position, rawEnd: Position, gridSize: number): Position {
  const dx = rawEnd.x - start.x;
  const dy = rawEnd.y - start.y;

  if (dx === 0 && dy === 0) {
    return start;
  }

  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const snappedAngle = Math.round(angle / DEG_45) * DEG_45;

  const projected = {
    x: start.x + Math.cos(snappedAngle) * length,
    y: start.y + Math.sin(snappedAngle) * length
  };

  return snapToGrid(projected, gridSize);
}
