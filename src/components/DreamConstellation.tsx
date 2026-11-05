import React, { memo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { constellationLine, getConstellationMap } from '../utils/constellation';

const DUST = [[7, 19], [20, 76], [43, 10], [87, 74], [94, 20], [10, 55], [80, 9], [47, 90], [58, 45], [34, 85], [89, 49], [18, 8]];
const HEIGHT = 138;

function DreamConstellation({ count }: { count: number | null }) {
  const [width, setWidth] = useState(0);
  const map = getConstellationMap(count);
  const loading = count === null;
  return <View style={styles.container} accessible accessibilityLabel={loading ? '꿈 별자리를 불러오는 중입니다' : `나의 꿈 별자리. ${map.name}, ${map.lit}/6개. 꿈 ${map.total}개, 완성한 별자리 ${map.completed}개${map.complete ? '. 별자리를 완성했어요' : ''}`}>
    <View style={styles.header}>
      <View style={styles.heading}><Text style={styles.title}>나의 꿈 별자리</Text><Text style={styles.name}>{loading ? '별빛을 불러오는 중' : map.name}</Text></View>
      <View style={styles.counter}><MaterialCommunityIcons name={map.complete ? 'check-circle-outline' : 'star-four-points'} size={13} color="#F5D88C" /><Text style={styles.counterText}>{loading ? '— / 6' : `${map.lit} / 6`}</Text></View>
    </View>
    <View style={styles.sky} onLayout={event => setWidth(Math.max(0, event.nativeEvent.layout.width - 36))} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.nebula} /><View style={styles.nebulaBlue} />
      {DUST.map(([x, y], i) => <View key={`dust-${i}`} style={[styles.dust, { left: `${x}%`, top: `${y}%`, opacity: i % 3 === 0 ? 0.7 : 0.25 }]} />)}
      <View style={styles.map}>
        {width > 0 && map.points.slice(0, -1).map((point, i) => {
          const line = constellationLine(point, map.points[i + 1], width, HEIGHT);
          const lit = !loading && i + 1 < map.lit;
          return <View key={`line-${i}`} style={[styles.line, { left: line.left, top: line.top, width: line.width, backgroundColor: lit ? '#D9BC79' : '#354862', height: lit ? 1.5 : 1, transform: [{ rotate: `${line.angle}rad` }] }]} />;
        })}
        {map.points.map(([x, y], i) => {
          const lit = !loading && i < map.lit;
          return <View key={`star-${i}`} style={[styles.node, { left: `${x}%`, top: `${y}%` }]}>
            {lit ? <><View style={styles.halo} /><View style={styles.innerHalo} /><MaterialCommunityIcons name="star-four-points" size={i === map.lit - 1 ? 25 : 20} color="#FFE5A3" /></> : <View style={styles.unlit} />}
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
  container: { marginHorizontal: 18, marginBottom: 18, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#30425E', backgroundColor: '#0C192E', overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heading: { flex: 1 }, title: { color: '#B8C7DC', fontSize: 11, fontWeight: '600' },
  name: { color: '#F8E5BA', fontSize: 16, lineHeight: 23, fontWeight: '700', marginTop: 5 },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: '#23334B' },
  counterText: { color: '#F4DCA6', fontSize: 11, fontWeight: '700' },
  sky: { height: HEIGHT + 24, width: '100%', maxWidth: 420, alignSelf: 'center', marginVertical: 6, overflow: 'hidden' },
  map: { position: 'absolute', left: 18, right: 18, top: 12, height: HEIGHT },
  nebula: { position: 'absolute', width: 180, height: 100, borderRadius: 90, backgroundColor: '#23354C', opacity: 0.35, top: 30, left: '14%', transform: [{ rotate: '-25deg' }] },
  nebulaBlue: { position: 'absolute', width: 140, height: 70, borderRadius: 70, backgroundColor: '#554A67', opacity: 0.13, top: 60, right: '12%' },
  dust: { position: 'absolute', width: 2, height: 2, borderRadius: 1, backgroundColor: '#C8D8EC' },
  line: { position: 'absolute' },
  node: { position: 'absolute', width: 28, height: 28, marginLeft: -14, marginTop: -14, justifyContent: 'center', alignItems: 'center' },
  halo: { position: 'absolute', width: 36, height: 36, borderRadius: 18, backgroundColor: '#E9CB82', opacity: 0.07 },
  innerHalo: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: '#E9CB82', opacity: 0.12 },
  unlit: { width: 7, height: 7, borderRadius: 4, borderWidth: 1, borderColor: '#65809D', backgroundColor: '#15263E' },
  footerRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 5 },
  total: { color: '#BCCBE0', fontSize: 10, lineHeight: 16 }, chapter: { color: '#899CB9', fontSize: 10, lineHeight: 16 },
  hint: { color: '#A5B8D2', fontSize: 11, lineHeight: 18, marginTop: 7 },
});
