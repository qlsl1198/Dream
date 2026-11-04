import React from 'react';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getConstellationProgress } from '../utils/dreamWorld';

export default function DreamJourneyBanner({ count }: { count: number }) {
  const progress = getConstellationProgress(count);
  return <ImageBackground source={require('../../assets/dream-world/moon-lake.png')} style={styles.banner} imageStyle={styles.art}>
    <LinearGradient colors={['#0B142620', '#0B1426E8']} style={styles.content}>
      <View style={styles.copy}>
        <Text style={styles.title}>꿈이 모여 별자리가 돼요</Text>
        <Text style={styles.text}>{progress.total}개의 꿈 · {progress.completed}개의 별자리</Text>
        <Text style={styles.caption}>나의 속도로, 한 조각씩.</Text>
      </View>
      <Image source={require('../../assets/dream-world/mongi.png')} style={styles.rabbit} resizeMode="contain" accessible={false} />
    </LinearGradient>
  </ImageBackground>;
}
const styles = StyleSheet.create({
  banner: { minHeight: 176, marginBottom: 20, borderRadius: 22, overflow: 'hidden', backgroundColor: '#15243A' },
  art: { borderRadius: 22 },
  content: { minHeight: 176, padding: 20, flexDirection: 'row', alignItems: 'flex-end' },
  copy: { flex: 1, paddingBottom: 6 },
  title: { color: '#F7F1E5', fontSize: 18, lineHeight: 26, fontWeight: '700' },
  text: { color: '#E8CE96', fontSize: 13, lineHeight: 21, marginTop: 8 },
  caption: { color: '#D1DCEC', fontSize: 12, lineHeight: 20, marginTop: 5 },
  rabbit: { width: '30%', maxWidth: 120, height: 120, marginLeft: 8 },
});
