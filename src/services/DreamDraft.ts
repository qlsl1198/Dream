import { DREAM_TYPES, EMOTIONS, DreamTypeKey } from '../constants/AppConfig';

export interface DreamDraft {
  content: string; emotion: string; dreamType: DreamTypeKey;
  vividness: number; sleepQuality: number; tagsInput: string;
}
export const EMPTY_DRAFT: DreamDraft = { content: '', emotion: '', dreamType: 'normal', vividness: 5, sleepQuality: 5, tagsInput: '' };
export function decodeDraft(raw: string | null): DreamDraft {
  if (!raw) return { ...EMPTY_DRAFT };
  // Earlier versions saved only plain text.
  if (!raw.startsWith('dreamlog-draft-v1:')) return { ...EMPTY_DRAFT, content: raw.slice(0, 5000) };
  const value = JSON.parse(raw.slice('dreamlog-draft-v1:'.length));
  if (!value || typeof value.content !== 'string' || value.content.length > 5000 ||
    !['', ...EMOTIONS.map(e => e.key)].includes(value.emotion) ||
    !DREAM_TYPES.some(t => t.key === value.dreamType) ||
    ![value.vividness, value.sleepQuality].every(n => Number.isInteger(n) && n >= 0 && n <= 10) ||
    typeof value.tagsInput !== 'string' || value.tagsInput.length > 2000) throw Error('Invalid draft');
  return value;
}
export const encodeDraft = (draft: DreamDraft) => 'dreamlog-draft-v1:' + JSON.stringify(draft);
