import type MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export type SymbolVisual = { icon: keyof typeof MaterialCommunityIcons.glyphMap; tint: string; landscape?: 'lake' | 'garden' };
const ICONS: Record<string, SymbolVisual['icon']> = {
  snake: 'snake', water: 'waves', falling: 'arrow-down', flying: 'feather', teeth: 'tooth-outline',
  exam: 'clipboard-text-outline', chase: 'run-fast', house: 'home-outline', death: 'ghost-outline',
  baby: 'baby-face-outline', car: 'car-outline', fire: 'fire', money: 'cash-multiple', dog: 'dog-side', cat: 'cat',
  school: 'school-outline', bridge: 'bridge', mirror: 'mirror-rectangle', phone: 'cellphone', stairs: 'stairs',
  red: 'circle-outline', black: 'circle-outline', three: 'numeric-3', lost: 'compass-off-outline', wedding: 'ring',
  ocean: 'waves', mountain: 'image-filter-hdr', blood: 'water-outline',
};
const TINTS: Record<string, string> = { 동물: '#B6A6D7', 사람: '#D0B1C8', 자연: '#99BED9', 장소: '#A6C6B1', 행동: '#B2B5DF', 사물: '#CFBA91', 감정: '#C3A8B9', '숫자·색': '#B5B1D5' };
export function getSymbolVisual(id: string, category: string): SymbolVisual {
  const landscape = ['water', 'ocean', 'mountain'].includes(id) ? 'lake' : ['house', 'school', 'bridge', 'stairs'].includes(id) ? 'garden' : undefined;
  return { icon: ICONS[id] ?? 'book-open-page-variant-outline', tint: TINTS[category] ?? '#A7B5C9', landscape };
}
export function getSymbolColumns(width: number, fontScale = 1): 1 | 2 {
  return width < 360 || fontScale > 1.3 ? 1 : 2;
}
