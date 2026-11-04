import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getConstellationProgress } from '../utils/dreamWorld';

const GREETINGS = ['어렴풋한 장면 하나도 좋아요.', '오늘은 어떤 풍경을 만났나요?', '잠깐 쉬어가도 괜찮아요. 꿈은 기다려줄 거예요.'];
const STAR_POINTS = [{ x: 8, y: 28 }, { x: 25, y: 60 }, { x: 42, y: 18 }, { x: 59, y: 48 }, { x: 76, y: 12 }, { x: 93, y: 36 }];

interface Props { count: number | null; busy: boolean; justSaved: boolean }

export default function DreamCompanion({ count, busy, justSaved }: Props) {
  const [greeting, setGreeting] = useState(0);
  const [greetedAfterSave, setGreetedAfterSave] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [skyWidth, setSkyWidth] = useState(0);
  const scale = useRef(new Animated.Value(1)).current;
  const progress = getConstellationProgress(count ?? 0);
  useEffect(() => { setGreetedAfterSave(false); }, [justSaved]);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReducedMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => { active = false; subscription.remove(); scale.stopAnimation(); };
  }, [scale]);
  const greet = () => {
    setGreeting(value => (value + 1) % GREETINGS.length);
    setGreetedAfterSave(true);
    scale.stopAnimation();
    if (!reducedMotion) Animated.sequence([
      Animated.timing(scale, { toValue: 1.06, duration: 160, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };
  const message = busy ? '꿈의 조각을 살펴보는 중이에요…' : justSaved && !greetedAfterSave ? '꿈 한 조각이 별이 되었어요. 함께 간직해요!' : GREETINGS[greeting];
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#223553', '#101D33']} style={styles.hero}>
        <View style={styles.copy}>
          <Text style={styles.title}>달토끼 몽이</Text>
          <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text>
          <Text style={styles.tapHint}>몽이를 살짝 눌러 인사해요</Text>
        </View>
        <Pressable onPress={greet} accessibilityRole="button" accessibilityLabel="달토끼 몽이에게 인사하기" style={styles.rabbitButton}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Image source={require('../../assets/dream-world/mongi.png')} style={styles.rabbit} resizeMode="contain" accessible={false} />
          </Animated.View>
        </Pressable>
      </LinearGradient>
      <View style={styles.constellation} accessible accessibilityLabel={count === null ? '꿈 별자리를 불러오는 중입니다' : `꿈 ${progress.total}개, 완성한 별자리 ${progress.completed}개, 다음 별자리 ${progress.stars}/6개`}>
        <View style={styles.row}>
          <Text style={styles.constellationTitle}>나의 꿈 별자리</Text>
          <Text style={styles.count}>{count === null ? '불러오는 중' : `${progress.total}개의 꿈 · ${progress.completed}개 완성`}</Text>
        </View>
        <View style={styles.sky} onLayout={event => setSkyWidth(event.nativeEvent.layout.width)}>
          {skyWidth > 0 && STAR_POINTS.slice(0, -1).map((point, index) => {
            const next = STAR_POINTS[index + 1];
            const dx = (next.x - point.x) * skyWidth / 100;
            const dy = next.y - point.y;
            const length = Math.hypot(dx, dy);
            return <View key={`line-${index}`} style={{ position: 'absolute', height: 1,
              width: length, left: point.x * skyWidth / 100 + 7 + dx / 2 - length / 2,
              top: point.y + 18 + dy / 2, backgroundColor: count !== null && index + 1 < progress.stars ? '#C5AE76' : '#2A3A52',
              transform: [{ rotate: `${Math.atan2(dy, dx)}rad` }] }} />;
          })}
          {STAR_POINTS.map((point, index) => (
            <Text key={index} style={[styles.star, { left: `${point.x}%`, top: point.y, color: count !== null && index < progress.stars ? '#F5D88C' : '#50617D' }]}>{count !== null && index < progress.stars ? '✦' : '·'}</Text>
          ))}
        </View>
        <Text style={styles.footer}>{count === null ? '기록은 이 기기 안에 머물러요.' : `기록 하나에 별 하나. ${6 - progress.stars}개를 더 모으면 새 별자리가 이어져요.`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20, borderRadius: 24, overflow: 'hidden', backgroundColor: '#101D33', borderWidth: 1, borderColor: '#304362' },
  hero: { flexDirection: 'row', alignItems: 'center', padding: 20, minHeight: 166 },
  copy: { flex: 1 },
  eyebrow: { color: '#A8BCD9', fontSize: 9, fontWeight: '700', letterSpacing: 1.3 },
  title: { color: '#FFF3D7', fontSize: 23, fontWeight: '700' },
  message: { color: '#DBE5F5', fontSize: 13, lineHeight: 21, marginTop: 10 },
  tapHint: { color: '#A8BCD9', fontSize: 10, marginTop: 16 },
  rabbitButton: { width: '38%', maxWidth: 180, minWidth: 92, minHeight: 140, justifyContent: 'center' },
  rabbit: { width: '100%', height: 132 },
  constellation: { paddingHorizontal: 20, paddingBottom: 18 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  constellationTitle: { color: '#E4EAF6', fontSize: 12, fontWeight: '700' },
  count: { color: '#A8BCD9', fontSize: 11 },
  sky: { height: 88, marginRight: 12 },
  star: { position: 'absolute', fontSize: 26 },
  footer: { color: '#ACBCD2', fontSize: 11, lineHeight: 18 },
});
