import type { ImageSourcePropType } from 'react-native';
import { getDreamScene } from '../utils/dreamWorld';

const LAKE: ImageSourcePropType = require('../../assets/dream-world/moon-lake.png');
const GARDEN: ImageSourcePropType = require('../../assets/dream-world/moon-garden.png');

export function getDreamArtwork(content: string, symbols?: readonly string[]): ImageSourcePropType {
  const scene = getDreamScene(content, symbols);
  return scene.id === 'forest' || scene.id === 'city' ? GARDEN : LAKE;
}
