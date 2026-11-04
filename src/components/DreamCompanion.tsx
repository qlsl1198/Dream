import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getConstellationProgress } from '../utils/dreamWorld';
import { canAnimateCompanion, CompanionMood, getCompanionReaction } from '../utils/companionMood';
import MongiSprite from './MongiSprite';

const TOUCH_MOODS: CompanionMood[] = ['happy', 'surprised', 'calm'];
const STAR_POINTS = [{ x: 8, y: 28 }, { x: 25, y: 60 }, { x: 42, y: 18 }, { x: 59, y: 48 }, { x: 76, y: 12 }, { x: 93, y: 36 }];

interface Props { count: number | null; busy: boolean; justSaved: boolean; emotion?: string; focused?: boolean }

export default function DreamCompanion({ count, busy, justSaved, emotion = '', focused = true }: Props) {
  const touches = useRef(0);
  const [interaction, setInteraction] = useState<CompanionMood | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [foreground, setForeground] = useState(AppState.currentState !== 'background' && AppState.currentState !== 'inactive');
  const [skyWidth, setSkyWidth] = useState(0);
  const scale = useRef(new Animated.Value(1)).current;
  const ambient = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reaction = getCompanionReaction({ emotion, busy, celebrating, interaction });
  const animated = canAnimateCompanion(reducedMotion, focused, foreground);
  const progress = getConstellationProgress(count ?? 0);
  useEffect(() => {
    if (!justSaved || busy) { setCelebrating(false); return; }
    setCelebrating(true);
    const timer = setTimeout(() => setCelebrating(false), 3800);
    return () => clearTimeout(timer);
  }, [justSaved, busy]);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReducedMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    const appSubscription = AppState.addEventListener('change', state => setForeground(state === 'active'));
    return () => { active = false; subscription.remove(); appSubscription.remove(); };
  }, []);
  useEffect(() => {
    if (touchTimer.current) clearTimeout(touchTimer.current);
    setInteraction(null);
    return () => { if (touchTimer.current) clearTimeout(touchTimer.current); };
  }, [emotion, busy, focused, foreground]);
  useEffect(() => {
    ambient.stopAnimation(); pulse.stopAnimation(); scale.stopAnimation();
    ambient.setValue(0); pulse.setValue(0); scale.setValue(1);
    if (!animated) return;
    const duration = reaction.mood === 'thinking' ? 1000 : reaction.mood === 'celebrate' ? 550 : 2100;
    const breathing = Animated.loop(Animated.sequence([
      Animated.timing(ambient, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(ambient, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    const glow = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true, isInteraction: false }),
      Animated.timing(pulse, { toValue: 0, duration: 1000, useNativeDriver: true, isInteraction: false }),
    ]));
    breathing.start(); glow.start();
    return () => { breathing.stop(); glow.stop(); ambient.stopAnimation(); pulse.stopAnimation(); scale.stopAnimation(); };
  }, [animated, reaction.mood, ambient, pulse, scale]);
  useEffect(() => {
    if (!animated || !interaction) return;
    const bounce = Animated.sequence([
      Animated.timing(scale, { toValue: 1.08, duration: 140, useNativeDriver: true, isInteraction: false }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, isInteraction: false }),
    ]);
    bounce.start();
    return () => bounce.stop();
  }, [animated, interaction, scale]);
  const greet = () => {
    setInteraction(TOUCH_MOODS[touches.current++ % TOUCH_MOODS.length]);
    if (touchTimer.current) clearTimeout(touchTimer.current);
    touchTimer.current = setTimeout(() => setInteraction(null), 2400);
  };
  const lift = reaction.mood === 'celebrate' || reaction.mood === 'happy' ? -11 : -5;
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#223553', '#101D33']} style={styles.hero}>
        <View style={styles.copy}>
          <Text style={styles.title}>달토끼 몽이</Text>
          <Text style={styles.mood}>{reaction.label}</Text>
          <Text accessibilityLiveRegion="polite" style={styles.message}>{reaction.message}</Text>
          <Text style={styles.tapHint}>몽이를 살짝 눌러 인사해요</Text>
        </View>
        <Pressable onPress={greet} accessibilityRole="button" accessibilityLabel={`달토끼 몽이에게 인사하기. ${reaction.label}`} accessibilityHint="살짝 누르면 표정과 인사가 바뀝니다" style={styles.rabbitButton}>
          <Animated.View pointerEvents="none" style={[styles.glow, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.22] }) }]} />
          <Animated.View style={{ transform: [{ translateY: ambient.interpolate({ inputRange: [0, 1], outputRange: [0, lift] }) },
            { rotate: ambient.interpolate({ inputRange: [0, 1], outputRange: [reaction.mood === 'thinking' ? '-3deg' : '-1deg', reaction.mood === 'thinking' ? '3deg' : '1deg'] }) },
            { scale: Animated.multiply(scale, ambient.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] })) }] }}>
            <MongiSprite mood={reaction.mood} />
          </Animated.View>
          <Animated.Text pointerEvents="none" accessible={false} style={[styles.sparkle, { opacity: pulse, transform: [{ translateY: pulse.interpolate({ inputRange: [0, 1], outputRange: [4, -8] }) }] }]}>✦</Animated.Text>
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
  mood: { color: '#E8CE96', fontSize: 10, marginTop: 8, fontWeight: '600' },
  message: { color: '#DBE5F5', fontSize: 13, lineHeight: 21, marginTop: 10 },
  tapHint: { color: '#A8BCD9', fontSize: 10, marginTop: 16 },
  rabbitButton: { width: '38%', maxWidth: 180, minWidth: 92, minHeight: 140, justifyContent: 'center' },
  glow: { position: 'absolute', width: 94, height: 94, borderRadius: 47, backgroundColor: '#E8CE96', alignSelf: 'center' },
  sparkle: { position: 'absolute', right: 2, top: 16, color: '#F5D88C', fontSize: 22 },
  constellation: { paddingHorizontal: 20, paddingBottom: 18 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  constellationTitle: { color: '#E4EAF6', fontSize: 12, fontWeight: '700' },
  count: { color: '#A8BCD9', fontSize: 11 },
  sky: { height: 88, marginRight: 12 },
  star: { position: 'absolute', fontSize: 26 },
  footer: { color: '#ACBCD2', fontSize: 11, lineHeight: 18 },
});
