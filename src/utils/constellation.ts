import { localDateKey } from './dreamHelpers';

const MAPS = [
  { name: '초승달자리', points: [[62, 12], [40, 20], [29, 43], [36, 68], [57, 79], [77, 66]] },
  { name: '달빛 고래자리', points: [[15, 38], [35, 58], [62, 61], [82, 34], [74, 17], [61, 35]] },
  { name: '작은 날개자리', points: [[14, 25], [35, 39], [50, 67], [65, 39], [86, 25], [50, 15]] },
  { name: '별꽃자리', points: [[50, 12], [72, 30], [68, 62], [50, 80], [28, 62], [28, 30]] },
] as const;

// Stable, varied star field. No random re-rendering or simultaneous background blink.
export const CONSTELLATION_STAR_FIELD = Array.from({ length: 54 }, (_, i) => {
  const seed = (Math.imul(i + 17, 2654435761) >>> 0);
  return { x: 2 + seed % 960 / 10, y: 3 + (seed >>> 10) % 920 / 10,
    size: i % 11 === 0 ? 1.6 : i % 3 === 0 ? 1 : 0.65,
    opacity: i % 11 === 0 ? 0.65 : 0.13 + (i % 5) * 0.065 };
});

export function getConstellationMap(count: number | null, requestedChapter?: number) {
  const total = count !== null && Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  const latestChapter = Math.max(1, Math.ceil(total / 6));
  const chapter = Math.max(1, Math.min(latestChapter, requestedChapter ?? latestChapter));
  const lit = Math.min(6, Math.max(0, total - (chapter - 1) * 6));
  const complete = lit === 6;
  return { ...MAPS[(chapter - 1) % MAPS.length], total, chapter, lit, complete, completed: Math.floor(total / 6) };
}

export function constellationLine(a: readonly number[], b: readonly number[], width: number, height: number) {
  const x = a[0] * width / 100; const y = a[1] * height / 100;
  const dx = (b[0] - a[0]) * width / 100; const dy = (b[1] - a[1]) * height / 100;
  const length = Math.hypot(dx, dy);
  return { left: x + dx / 2 - length / 2, top: y + dy / 2, width: length, angle: Math.atan2(dy, dx) };
}

/** Dates for the displayed chapter, oldest first. Never mutate stored records. */
export function getConstellationRecords<T extends { createdAt: string; date: string; id?: string }>(records: readonly T[], chapter?: number): T[] {
  const map = getConstellationMap(records.length, chapter);
  return [...records].sort((a, b) => Date.parse(a.createdAt || a.date) - Date.parse(b.createdAt || b.date) || (a.id ?? '').localeCompare(b.id ?? ''))
    .slice((map.chapter - 1) * 6, (map.chapter - 1) * 6 + map.lit);
}

export function getConstellationStarDates(records: readonly { createdAt: string; date: string }[]) {
  return getConstellationRecords(records)
    .map(record => record.createdAt || record.date).join('|');
}

export function todayStarMask(dates: string, today = localDateKey()) {
  return dates ? dates.split('|').map(value => {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) && localDateKey(date) === today;
  }) : [];
}

export function constellationMotionMode(active: boolean, complete: boolean, mask: readonly boolean[]) {
  return !active ? 'still' : complete ? 'complete' : mask.some(Boolean) ? 'today' : 'still';
}
