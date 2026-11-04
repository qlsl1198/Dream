import type { DreamRecord } from './DreamStorage';
import type { MemoryRecord } from './MemoryStorage';

const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown, max = 10000): value is string => typeof value === 'string' && value.length <= max;
const strings = (value: unknown) => value === undefined || (Array.isArray(value) && value.length <= 100 && value.every(v => text(v, 2000)));
const date = (value: unknown) => text(value, 40) && Number.isFinite(Date.parse(value));

export function validateDream(value: unknown): value is DreamRecord {
  if (!object(value)) return false;
  return text(value.id, 100) && value.id.length > 0 && text(value.content, 5000) &&
    text(value.interpretation) && text(value.emotion, 30) && date(value.date) &&
    (value.createdAt === undefined || date(value.createdAt)) &&
    typeof value.confidence === 'number' && Number.isFinite(value.confidence) && value.confidence >= 0 && value.confidence <= 1 &&
    strings(value.recommendations) && strings(value.themes) && strings(value.matchedSymbols) && strings(value.tags) &&
    (value.isFavorite === undefined || typeof value.isFavorite === 'boolean') &&
    (value.notes === undefined || text(value.notes)) &&
    ['vividness', 'sleepQuality'].every(k => value[k] === undefined || (typeof value[k] === 'number' && Number.isFinite(value[k]) && value[k] >= 0 && value[k] <= 10)) &&
    (value.dreamType === undefined || ['normal', 'lucid', 'nightmare', 'recurring'].includes(String(value.dreamType)));
}

export function validateMemory(value: unknown): value is MemoryRecord {
  if (!object(value)) return false;
  return text(value.id, 100) && text(value.description, 5000) && date(value.date) && date(value.createdAt) &&
    Array.isArray(value.clues) && strings(value.clues) && Array.isArray(value.questions) && strings(value.questions) &&
    ['in_progress', 'completed', 'failed'].includes(String(value.status)) &&
    (value.aiAnalysis === undefined || text(value.aiAnalysis)) &&
    (value.recoveredMemory === undefined || text(value.recoveredMemory));
}

export function parseBackup(raw: string): { dreams: DreamRecord[]; memories: MemoryRecord[] } {
  if (raw.length > 10 * 1024 * 1024) throw new Error('백업은 10MB 이하만 가져올 수 있습니다.');
  const data: unknown = JSON.parse(raw);
  if (!object(data) || !Array.isArray(data.dreams) || data.dreams.length > 10000 || !data.dreams.every(validateDream)) {
    throw new Error('꿈 기록 형식이 올바르지 않습니다.');
  }
  const memories = data.memories ?? [];
  if (!Array.isArray(memories) || memories.length > 10000 || !memories.every(validateMemory)) throw new Error('회상 기록 형식이 올바르지 않습니다.');
  const normalize = (dream: DreamRecord) => ({ ...dream, createdAt: dream.createdAt || new Date(dream.date).toISOString() });
  return { dreams: data.dreams.map(normalize), memories };
}

export function escapeHTML(value: string): string {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
}
