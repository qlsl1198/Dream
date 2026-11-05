import React, { memo, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { CONSTELLATION_STAR_FIELD, constellationLine, constellationMotionMode, getConstellationMap, todayStarMask } from '../utils/constellation';
import { localDateKey } from '../utils/dreamHelpers';

const HEIGHT = 138;

function DreamConstellation({ count, starDates = '', animate = false }: { count: number | null; starDates?: string; animate?: boolean }) {
  const [width, setWidth] = useState(0);
  const [today, setToday] = useState(localDateKey);
  const lights = useRef(Array.from({ length: 6 }, () => new Animated.Value(0))).current;
  const map = getConstellationMap(count);
  const loading = count === null;
  const maskKey = todayStarMask(starDates, today).map(Boolean).map(Number).join('');
  const mode = constellationMotionMode(animate && !loading, map.complete, [...maskKey].map(v => v === '1'));
  useEffect(() => {
    if (!animate) return;
    setToday(localDateKey());
    const timer = setInterval(() => setToday(localDateKey()), 60000);
    return () => clearInterval(timer);
  }, [animate]);
  useEffect(() => {
    lights.forEach(light => { light.stopAnimation(); light.setValue(0); });
    if (mode === 'still') return;
    const rise = (light: Animated.Value, toValue: number, duration: number) => Animated.timing(light, {
      toValue, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false,
    });
    const flash = (light: Animated.Value) => Animated.sequence([rise(light, 1, 420), rise(light, 0, 620)]);
    const animation = mode === 'complete'
      ? Animated.loop(Animated.sequence([
        Animated.delay(500),
        ...lights.map(flash),
        Animated.parallel(lights.map(flash)),
        Animated.delay(1800),
      ]))
      : Animated.parallel(lights.map((light, i) => maskKey[i] === '1'
        ? Animated.sequence([Animated.delay(i * 160), Animated.loop(Animated.sequence([rise(light, 1, 850), rise(light, 0, 1050), Animated.delay(350)]))])
        : Animated.delay(0)));
    animation.start();
    return () => { animation.stop(); lights.forEach(light => { light.stopAnimation(); light.setValue(0); }); };
  }, [mode, maskKey, lights]);
  return <View style={styles.container} accessible accessibilityLabel={loading ? '꿈 별자리를 불러오는 중입니다' : `나의 꿈 별자리. ${map.name}, ${map.lit}/6개. 꿈 ${map.total}개, 완성한 별자리 ${map.completed}개${map.complete ? '. 별자리를 완성했어요' : ''}`}>
    <View style={styles.header}>
      <View style={styles.heading}><Text style={styles.title}>나의 꿈 별자리</Text><Text style={styles.name}>{loading ? '별빛을 불러오는 중' : map.name}</Text></View>
      <Text style={styles.counterText}>{loading ? '— / 6' : `${map.lit} / 6`}</Text>
    </View>
    <View style={styles.sky} onLayout={event => setWidth(Math.max(0, event.nativeEvent.layout.width - 36))} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {CONSTELLATION_STAR_FIELD.map((star, i) => <View key={`dust-${i}`} style={[styles.dust, { left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size, opacity: star.opacity }]} />)}
      <View style={styles.map}>
        {width > 0 && map.points.slice(0, -1).map((point, i) => {
          const line = constellationLine(point, map.points[i + 1], width, HEIGHT);
          const lit = !loading && i + 1 < map.lit;
          return <View key={`line-${i}`} style={[styles.line, { left: line.left, top: line.top, width: line.width, backgroundColor: lit ? '#9ABAD16B' : '#7193AE20', height: 0.5, transform: [{ rotate: `${line.angle}rad` }] }]} />;
        })}
        {map.points.map(([x, y], i) => {
          const lit = !loading && i < map.lit;
          return <View key={`star-${i}`} style={[styles.node, { left: `${x}%`, top: `${y}%` }]}>
            {lit ? <Animated.View style={[styles.light, {
              opacity: lights[i].interpolate({ inputRange: [0, 1], outputRange: [mode === 'complete' || (mode === 'today' && maskKey[i] === '1') ? 0.3 : 1, 1] }),
              transform: [{ scale: lights[i].interpolate({ inputRange: [0, 1], outputRange: [1, 1.24] }) }],
            }]}>
              <Animated.View style={[styles.halo, { opacity: lights[i].interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.4] }) }]} />
              <View style={[styles.ray, styles.rayHorizontal]} /><View style={[styles.ray, styles.rayVertical]} />
              <View style={[styles.core, { width: i === map.lit - 1 ? 4 : 3, height: i === map.lit - 1 ? 4 : 3 }]} />
            </Animated.View> : <View style={styles.unlit} />}
          </View>;
        })}
      </View>
    </View>
    <View style={styles.footerRow}><Text style={styles.total}>{loading ? '기록은 이 기기 안에 머물러요' : `${map.total}개의 꿈 · ${map.completed}개 완성`}</Text><Text style={styles.chapter}>{map.chapter}번째 별자리</Text></View>
    <Text style={styles.hint}>{loading ? '꿈 한 조각이 작은 별이 돼요.' : map.complete ? '별자리를 완성했어요! 다음 꿈은 새로운 별의 시작이에요.' : `꿈 ${6 - map.lit}개를 더 모으면 이 별자리가 완성돼요.`}</Text>
  </View>;
}
export default memo(DreamConstellation);

const styles = StyleSheet.create({
  container: { marginHorizontal: 18, marginBottom: 18, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#263548', backgroundColor: '#070F1C', overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heading: { flex: 1 }, title: { color: '#B8C7DC', fontSize: 11, fontWeight: '600' },
  name: { color: '#E3ECF8', fontSize: 16, lineHeight: 23, fontWeight: '600', marginTop: 5 },
  counterText: { color: '#9EADC1', fontSize: 11, fontWeight: '500', letterSpacing: 1 },
  sky: { height: HEIGHT + 24, width: '100%', maxWidth: 420, alignSelf: 'center', marginVertical: 6, overflow: 'hidden' },
  map: { position: 'absolute', left: 18, right: 18, top: 12, height: HEIGHT },
  dust: { position: 'absolute', borderRadius: 2, backgroundColor: '#CEDDF2' },
  line: { position: 'absolute' },
  node: { position: 'absolute', width: 28, height: 28, marginLeft: -14, marginTop: -14, justifyContent: 'center', alignItems: 'center' },
  halo: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: '#C7DFFF', boxShadow: '0 0 9px 5px rgba(153, 195, 255, 0.32)' },
  light: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  core: { borderRadius: 3, backgroundColor: '#F4F8FF', boxShadow: '0 0 4px 1px rgba(219, 237, 255, 0.9)' },
  ray: { position: 'absolute', backgroundColor: '#D7E9FF', opacity: 0.2 },
  rayHorizontal: { width: 15, height: 0.5 }, rayVertical: { width: 0.5, height: 15 },
  unlit: { width: 2, height: 2, borderRadius: 1, backgroundColor: '#8191AA', opacity: 0.45 },
  footerRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 5 },
  total: { color: '#BCCBE0', fontSize: 10, lineHeight: 16 }, chapter: { color: '#899CB9', fontSize: 10, lineHeight: 16 },
  hint: { color: '#A5B8D2', fontSize: 11, lineHeight: 18, marginTop: 7 },
});
