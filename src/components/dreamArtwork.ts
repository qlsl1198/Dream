import type { ImageSourcePropType } from 'react-native';
import { getDreamScene } from '../utils/dreamWorld';

export const DREAM_ARTWORK: Record<ReturnType<typeof getDreamScene>['id'], ImageSourcePropType> = {
  sea: require('../../assets/dream-world/moon-lake.png'),
  forest: require('../../assets/dream-world/scene-forest.png'),
  sky: require('../../assets/dream-world/scene-sky.png'),
  city: require('../../assets/dream-world/scene-city.png'),
  cozy: require('../../assets/dream-world/scene-cozy.png'),
  storm: require('../../assets/dream-world/scene-storm.png'),
  night: require('../../assets/dream-world/moon-garden.png'),
};

export function getDreamArtwork(content: string, symbols?: readonly string[]): ImageSourcePropType {
  const scene = getDreamScene(content, symbols);
  return DREAM_ARTWORK[scene.id];
}
