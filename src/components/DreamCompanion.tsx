import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Easing, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DreamConstellation, { StarTarget } from './DreamConstellation';
import { canAnimateCompanion, CompanionMood, getCompanionReaction, TOUCH_MOODS } from '../utils/companionMood';
import MongiSprite from './MongiSprite';


interface Props { count: number | null; starDates?: string; busy: boolean; justSaved: boolean; emotion?: string; focused?: boolean; targets?: readonly StarTarget[]; onOpen?: (id: string) => void }

export default function DreamCompanion({ count, starDates = '', busy, justSaved, emotion = '', focused = true, targets, onOpen }: Props) {
  const narrow = useWindowDimensions().width < 360;
  const touches = useRef(0);
  const [interaction, setInteraction] = useState<CompanionMood | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [foreground, setForeground] = useState(AppState.currentState !== 'background' && AppState.currentState !== 'inactive');
  const scale = useRef(new Animated.Value(1)).current;
  const ambient = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reaction = getCompanionReaction({ emotion, busy, celebrating, interaction });
  const animated = canAnimateCompanion(reducedMotion, focused, foreground);
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
        <Pressable onPress={greet} accessibilityRole="button" accessibilityLabel={`달토끼 몽이에게 인사하기. ${reaction.label}`} accessibilityHint="살짝 누르면 표정과 인사가 바뀝니다" style={[styles.rabbitButton, narrow && styles.narrowRabbit]}>
          <Animated.View pointerEvents="none" style={[styles.glow, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.22] }) }]} />
          <Animated.View style={{ transform: [{ translateY: ambient.interpolate({ inputRange: [0, 1], outputRange: [0, lift] }) },
            { rotate: ambient.interpolate({ inputRange: [0, 1], outputRange: [reaction.mood === 'thinking' ? '-3deg' : '-1deg', reaction.mood === 'thinking' ? '3deg' : '1deg'] }) },
            { scale: Animated.multiply(scale, ambient.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] })) }] }}>
            <MongiSprite mood={reaction.mood} compact />
          </Animated.View>
          <Animated.Text pointerEvents="none" accessible={false} style={[styles.sparkle, { opacity: pulse, transform: [{ translateY: pulse.interpolate({ inputRange: [0, 1], outputRange: [4, -8] }) }] }]}>✦</Animated.Text>
        </Pressable>
      </LinearGradient>
      <DreamConstellation count={count} starDates={starDates} animate={animated && !busy} targets={targets} onOpen={onOpen} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20, borderRadius: 24, overflow: 'hidden', backgroundColor: '#101D33', borderWidth: 1, borderColor: '#304362' },
  hero: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 8, minHeight: 140 },
  copy: { flex: 1, minWidth: 0 },
  eyebrow: { color: '#A8BCD9', fontSize: 9, fontWeight: '700', letterSpacing: 1.3 },
  title: { color: '#FFF3D7', fontSize: 20, lineHeight: 27, fontWeight: '700' },
  mood: { color: '#E8CE96', fontSize: 11, marginTop: 4, fontWeight: '600' },
  message: { color: '#DBE5F5', fontSize: 13, lineHeight: 20, marginTop: 6 },
  tapHint: { color: '#A8BCD9', fontSize: 10, lineHeight: 16, marginTop: 8 },
  rabbitButton: { width: '34%', maxWidth: 150, minWidth: 82, minHeight: 104, flexShrink: 0, justifyContent: 'center' },
  narrowRabbit: { width: '28%', minWidth: 72 },
  glow: { position: 'absolute', width: 94, height: 94, borderRadius: 47, backgroundColor: '#E8CE96', alignSelf: 'center' },
  sparkle: { position: 'absolute', right: 2, top: 16, color: '#F5D88C', fontSize: 22 },
});
