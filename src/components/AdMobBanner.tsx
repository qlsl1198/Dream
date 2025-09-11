import React from 'react';
import { Platform, View, StyleSheet, Text } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useTheme } from '../contexts/ThemeContext';

// AdMob 지원 광고 크기 상수
export const ADMOB_AD_SIZES = {
  BANNER: BannerAdSize.BANNER,        // 표준 배너 (320x50)
  MEDIUM_RECTANGLE: BannerAdSize.MEDIUM_RECTANGLE, // 중간 직사각형 (300x250)
  LEADERBOARD: BannerAdSize.LEADERBOARD,   // 리더보드 (728x90)
  FULL_BANNER: BannerAdSize.FULL_BANNER,   // 풀 배너 (468x60)
  LARGE_BANNER: BannerAdSize.LARGE_BANNER, // 라지 배너 (320x100)
} as const;

interface AdMobBannerProps {
  unitId?: string;
  adSize?: keyof typeof ADMOB_AD_SIZES; // 미리 정의된 크기 사용
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: string) => void;
  onAdClicked?: () => void;
  style?: any;
}

const AdMobBanner: React.FC<AdMobBannerProps> = ({
  unitId,
  adSize = 'BANNER',
  onAdLoaded,
  onAdFailedToLoad,
  onAdClicked,
  style,
}) => {
  const { colors } = useTheme();
  
  // 환경변수 우선, 없으면 실제 AdMob 단위 ID 사용
  const envUnitId = process.env.EXPO_PUBLIC_ADMOB_UNIT_ID;
  const effectiveUnitId = envUnitId || unitId || TestIds.BANNER;
  const hasApiKey = Boolean(effectiveUnitId);

  // 웹에서는 광고를 표시하지 않음
  if (Platform.OS === 'web' || !hasApiKey) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      <BannerAd
        unitId={effectiveUnitId}
        size={ADMOB_AD_SIZES[adSize]}
        onAdLoaded={() => {
          console.log('AdMob 광고 로드 완료');
          onAdLoaded?.();
        }}
        onAdFailedToLoad={(error) => {
          console.log('AdMob 광고 로드 실패:', error);
          onAdFailedToLoad?.(error.message);
        }}
        onAdClicked={() => {
          console.log('AdMob 광고 클릭');
          onAdClicked?.();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 8,
    padding: 8,
  },
});

export default AdMobBanner;
