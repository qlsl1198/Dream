const MAPS = [
  { name: '초승달자리', points: [[62, 12], [40, 20], [29, 43], [36, 68], [57, 79], [77, 66]] },
  { name: '달빛 고래자리', points: [[15, 38], [35, 58], [62, 61], [82, 34], [74, 17], [61, 35]] },
  { name: '작은 날개자리', points: [[14, 25], [35, 39], [50, 67], [65, 39], [86, 25], [50, 15]] },
  { name: '별꽃자리', points: [[50, 12], [72, 30], [68, 62], [50, 80], [28, 62], [28, 30]] },
] as const;

export function getConstellationMap(count: number | null) {
  const total = count !== null && Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  const complete = total > 0 && total % 6 === 0;
  const chapter = complete ? total / 6 : Math.floor(total / 6) + 1;
  const lit = complete ? 6 : total % 6;
  return { ...MAPS[(chapter - 1) % MAPS.length], total, chapter, lit, complete, completed: Math.floor(total / 6) };
}

export function constellationLine(a: readonly number[], b: readonly number[], width: number, height: number) {
  const x = a[0] * width / 100; const y = a[1] * height / 100;
  const dx = (b[0] - a[0]) * width / 100; const dy = (b[1] - a[1]) * height / 100;
  const length = Math.hypot(dx, dy);
  return { left: x + dx / 2 - length / 2, top: y + dy / 2, width: length, angle: Math.atan2(dy, dx) };
}
