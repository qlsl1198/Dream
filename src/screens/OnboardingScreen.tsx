import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Modal,
  Alert,
  TouchableOpacity,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  SafeAreaView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { APP_CONFIG } from '../constants/AppConfig';
import { OnboardingService } from '../services/OnboardingService';

import LegalScreen from './LegalScreen';

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
    description: '기기 안에서 꿈을 돌아보세요. iOS 26과 Apple Intelligence 지원 기기에서는 온디바이스 AI, 그 외에는 기본 해석을 제공합니다.',
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
    title: '나의 속도로\n꿈을 모아보세요',
    description: '몽이와 함께 꿈을 별처럼 모아보세요. 감정과 상징을 돌아보며 나만의 이야기를 발견할 수 있어요. 데이터는 기기에만 저장됩니다.',
  },
];

interface OnboardingScreenProps {
  onDone: () => void;
}

export default function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [legalOpen, setLegalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const listRef = useRef<FlatList>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(next);
  };

  const finish = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await OnboardingService.acceptPrivacy();
      await OnboardingService.completeOnboarding();
      onDone();
    } catch { Alert.alert('저장 실패', '다시 시도해주세요.'); }
    finally { setSaving(false); }
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
            <View style={[styles.slide, { width }]}>
              {item.key === '1' ? <Image source={require('../../assets/dream-world/mongi.png')} style={{ width: 148, height: 148, marginBottom: 20 }} resizeMode="contain" accessible={false} /> : <View style={styles.iconWrap}>
                <Ionicons name={item.icon} size={52} color="#E8D5A3" />
              </View>}
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
            꿈 기록은 기기에 저장되고 AI 처리도 기기 안에서 진행됩니다. 공유와 백업은 직접 선택할 때만 내보냅니다.
          </Text>

          <TouchableOpacity onPress={() => setLegalOpen(true)} accessibilityRole="link" style={{ padding: 12, alignItems: 'center' }}><Text style={{ color: '#E8D5A3' }}>개인정보 처리방침 읽기</Text></TouchableOpacity>
          <TouchableOpacity disabled={saving} style={styles.cta} onPress={next} activeOpacity={0.85}>
            <Text style={styles.ctaText}>{index === SLIDES.length - 1 ? '시작하기' : '다음'}</Text>
            <Ionicons name="arrow-forward" size={18} color="#0B1426" />
          </TouchableOpacity>
        </View>
        <Modal visible={legalOpen} animationType="slide" onRequestClose={() => setLegalOpen(false)}><LegalScreen type="privacy" onClose={() => setLegalOpen(false)} /></Modal>
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
