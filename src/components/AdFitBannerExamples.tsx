import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import AdFitBanner, { ADFIT_AD_SIZES } from './AdFitBanner';

/**
 * AdFit 광고 크기 예제 컴포넌트
 * 다양한 광고 크기를 테스트할 때 사용
 */
const AdFitBannerExamples: React.FC = () => {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>AdFit 광고 크기 예제</Text>
      
      {/* 표준 배너 (320x50) */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          표준 배너 (320x50)
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          모바일 화면 상단/하단에 적합한 가장 일반적인 크기
        </Text>
        <AdFitBanner
          unitId="DAN-test-banner"
          adSize="BANNER"
          onAdLoaded={() => console.log('표준 배너 로드 완료')}
          onAdFailedToLoad={(error) => console.log('표준 배너 로드 실패:', error)}
        />
      </View>

      {/* 중간 직사각형 (300x250) */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          중간 직사각형 (300x250)
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          콘텐츠 중간에 삽입하기 좋은 크기, 높은 수익률
        </Text>
        <AdFitBanner
          unitId="DAN-test-medium"
          adSize="MEDIUM_RECTANGLE"
          onAdLoaded={() => console.log('중간 직사각형 로드 완료')}
          onAdFailedToLoad={(error) => console.log('중간 직사각형 로드 실패:', error)}
        />
      </View>

      {/* 리더보드 (728x90) */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          리더보드 (728x90)
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          태블릿이나 가로 모드에서 상단에 배치하기 적합
        </Text>
        <AdFitBanner
          unitId="DAN-test-leaderboard"
          adSize="LEADERBOARD"
          onAdLoaded={() => console.log('리더보드 로드 완료')}
          onAdFailedToLoad={(error) => console.log('리더보드 로드 실패:', error)}
        />
      </View>

      {/* 와이드 스카이스크래퍼 (160x600) */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          와이드 스카이스크래퍼 (160x600)
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          사이드바에 세로로 배치, 주로 웹에서 사용
        </Text>
        <AdFitBanner
          unitId="DAN-test-skyscraper"
          adSize="WIDE_SKYSCRAPER"
          onAdLoaded={() => console.log('스카이스크래퍼 로드 완료')}
          onAdFailedToLoad={(error) => console.log('스카이스크래퍼 로드 실패:', error)}
        />
      </View>

      {/* 사용법 가이드 */}
      <View style={[styles.guideSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.guideTitle, { color: colors.text }]}>사용법</Text>
        <Text style={[styles.guideText, { color: colors.textSecondary }]}>
          1. 미리 정의된 크기 사용: {'\n'}
          <Text style={{ fontFamily: 'monospace' }}>
            adSize="BANNER"
          </Text>
        </Text>
        <Text style={[styles.guideText, { color: colors.textSecondary }]}>
          2. 커스텀 크기 사용: {'\n'}
          <Text style={{ fontFamily: 'monospace' }}>
            width={320} height={50}
          </Text>
        </Text>
        <Text style={[styles.guideText, { color: colors.textSecondary }]}>
          3. 지원되는 크기: {'\n'}
          {Object.entries(ADFIT_AD_SIZES).map(([key, size]) => (
            <Text key={key} style={{ fontFamily: 'monospace' }}>
              {key}: {size.width}x{size.height}{'\n'}
            </Text>
          ))}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  guideSection: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 20,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  guideText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default AdFitBannerExamples;
