import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { APP_CONFIG } from '../constants/AppConfig';
import { OnboardingService } from '../services/OnboardingService';

const { width } = Dimensions.get('window');

interface Slide {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    key: '1',
    icon: 'moon',
    title: '꿈을 남기고\n의미를 찾으세요',
    description: '잠에서 깨자마자 꿈을 기록하면 AI와 상징 사전이 해석을 도와드립니다.',
  },
  {
    key: '2',
    icon: 'book',
    title: '한국형 꿈상징\n사전 탑재',
    description: '뱀, 물, 추락 등 자주 나오는 상징을 전통·심리 관점으로 바로 찾아볼 수 있어요.',
  },
  {
    key: '3',
    icon: 'analytics',
    title: '패턴과 스트릭으로\n꾸준히',
    description: '감정 통계, 연속 기록, 알림으로 꿈 일기를 습관으로 만드세요. 데이터는 기기에만 저장됩니다.',
  },
];

interface OnboardingScreenProps {
  onDone: () => void;
}

export default function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(next);
  };

  const finish = async () => {
    await OnboardingService.acceptPrivacy();
    await OnboardingService.completeOnboarding();
    onDone();
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
      setIndex(index + 1);
    } else {
      finish();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#0B1426', '#1A2744', '#243B5C']} style={styles.gradient}>
        <TouchableOpacity style={styles.skip} onPress={finish}>
          <Text style={styles.skipText}>건너뛰기</Text>
        </TouchableOpacity>

        <FlatList
          ref={listRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon} size={52} color="#E8D5A3" />
              </View>
              <Text style={styles.brand}>{APP_CONFIG.name}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          )}
        />

        <View style={styles.footer}>
          <View style={styles.dots}>
            {SLIDES.map((s, i) => (
              <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>

          <Text style={styles.privacyNote}>
            계속 진행하면 개인정보 처리방침에 동의하며,{'\n'}꿈 기록은 기기에만 저장됩니다.
          </Text>

          <TouchableOpacity style={styles.cta} onPress={next} activeOpacity={0.85}>
            <Text style={styles.ctaText}>{index === SLIDES.length - 1 ? '시작하기' : '다음'}</Text>
            <Ionicons name="arrow-forward" size={18} color="#0B1426" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B1426' },
  gradient: { flex: 1 },
  skip: { alignSelf: 'flex-end', padding: 20 },
  skipText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  slide: {
    width,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(232, 213, 163, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(232, 213, 163, 0.35)',
  },
  brand: {
    fontSize: 14,
    letterSpacing: 3,
    color: '#E8D5A3',
    fontWeight: '600',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F7F3EA',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: 'rgba(247, 243, 234, 0.75)',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: { paddingHorizontal: 24, paddingBottom: 36 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 18 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 4,
  },
  dotActive: { backgroundColor: '#E8D5A3', width: 20 },
  privacyNote: {
    textAlign: 'center',
    color: 'rgba(247,243,234,0.5)',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  cta: {
    backgroundColor: '#E8D5A3',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: { color: '#0B1426', fontSize: 16, fontWeight: '700', marginRight: 6 },
});
