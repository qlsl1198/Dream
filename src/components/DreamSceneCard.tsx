import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getDreamScene } from '../utils/dreamWorld';
import { getDreamArtwork } from './dreamArtwork';

interface Props { content: string; symbols?: readonly string[] }

export default function DreamSceneCard({ content, symbols }: Props) {
  const scene = getDreamScene(content, symbols);
  return (
    <View style={styles.card} accessible accessibilityLabel={`꿈 장면 카드, ${scene.title}. 꿈의 단어를 바탕으로 고른 상상 일러스트입니다.`}>
      <ImageBackground source={getDreamArtwork(content, symbols)} style={styles.image} imageStyle={styles.art}>
        <LinearGradient colors={['transparent', '#0B1426F2']} style={styles.shade}>
          <Text style={styles.eyebrow}>꿈의 풍경 · {scene.id === 'night' ? '달의 정원' : scene.title}</Text>
          <Text style={styles.title}>{scene.title}</Text>
          <Text style={styles.hint}>{scene.hint}</Text>
          <Text style={styles.caption}>꿈의 단어에서 영감을 받은 상상 카드</Text>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 22, overflow: 'hidden', marginVertical: 14, backgroundColor: '#162740' },
  image: { minHeight: 228, justifyContent: 'flex-end' },
  art: { resizeMode: 'cover' },
  shade: { padding: 22, paddingTop: 85 },
  eyebrow: { color: '#E8D5A3', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  title: { color: '#FFF7E8', fontSize: 25, fontWeight: '700', marginTop: 8 },
  hint: { color: '#E1E8F3', fontSize: 13, lineHeight: 21, marginTop: 6 },
  caption: { color: '#B6C4D9', fontSize: 10, marginTop: 16 },
});
