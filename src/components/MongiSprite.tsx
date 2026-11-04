import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { CompanionMood, getCompanionFrame } from '../utils/companionMood';

// A single preloaded atlas avoids separate image requests on every mood change.
const ATLAS = require('../../assets/dream-world/mongi-emotions.png');
const ORIGINAL = require('../../assets/dream-world/mongi.png');
export default function MongiSprite({ mood, blink = false }: { mood: CompanionMood; blink?: boolean }) {
  const [size, setSize] = useState(132);
  const [failed, setFailed] = useState(false);
  const frame = getCompanionFrame(mood, blink);
  return <View pointerEvents="none" accessible={false} style={styles.viewport}
    onLayout={event => setSize(Math.max(1, Math.min(event.nativeEvent.layout.width, event.nativeEvent.layout.height)))}>
    <View style={{ width: size, height: size, overflow: 'hidden' }}>
      <Image source={ATLAS} accessible={false} onError={() => setFailed(true)} resizeMode="stretch"
        style={{ position: 'absolute', width: size * 3, height: size * 2,
          left: -((frame ?? 0) % 3) * size, top: -Math.floor((frame ?? 0) / 3) * size,
          opacity: frame === null || failed ? 0 : 1 }} />
      {frame === null || failed ? <Image source={ORIGINAL} accessible={false} resizeMode="contain" style={StyleSheet.absoluteFillObject} /> : null}
    </View>
  </View>;
}
const styles = StyleSheet.create({ viewport: { width: '100%', height: 148, alignItems: 'center', justifyContent: 'center' } });
