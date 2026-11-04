import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { CompanionMood, getCompanionSpriteLocation } from '../utils/companionMood';

// A single preloaded atlas avoids separate image requests on every mood change.
const ATLASES = [require('../../assets/dream-world/mongi-emotions.png'), require('../../assets/dream-world/mongi-emotions-extra.png')];
const ORIGINAL = require('../../assets/dream-world/mongi.png');
export default function MongiSprite({ mood }: { mood: CompanionMood }) {
  const [size, setSize] = useState(132);
  const [failed, setFailed] = useState([false, false]);
  const [ready, setReady] = useState([false, false]);
  const frame = getCompanionSpriteLocation(mood);
  const showAtlas = frame !== null && ready[frame.sheet] && !failed[frame.sheet];
  return <View pointerEvents="none" accessible={false} style={styles.viewport}
    onLayout={event => setSize(Math.max(1, Math.min(event.nativeEvent.layout.width, event.nativeEvent.layout.height)))}>
    <View style={{ width: size, height: size, overflow: 'hidden' }}>
      <Image source={ORIGINAL} accessible={false} fadeDuration={0} resizeMode="contain"
        style={[StyleSheet.absoluteFillObject, { opacity: showAtlas ? 0 : 1 }]} />
      {ATLASES.map((source, sheet) => <Image key={sheet} source={source} accessible={false} fadeDuration={0}
        onLoad={() => setReady(previous => previous.map((value, index) => index === sheet ? true : value))}
        onError={() => setFailed(previous => previous.map((value, index) => index === sheet ? true : value))} resizeMode="stretch"
        style={{ position: 'absolute', width: size * 3, height: size * 2,
          left: -(frame?.column ?? 0) * size, top: -(frame?.row ?? 0) * size,
          opacity: showAtlas && frame?.sheet === sheet ? 1 : 0 }} />)}
    </View>
  </View>;
}
const styles = StyleSheet.create({ viewport: { width: '100%', height: 148, alignItems: 'center', justifyContent: 'center' } });
