import { Platform } from 'react-native';

/**
 * AdMob 헬퍼 — 배너는 AdMobBanner 컴포넌트를 사용합니다.
 * 전면/보상형은 단위 ID가 준비되면 react-native-google-mobile-ads API로 확장하세요.
 */
class AdMobService {
  private static instance: AdMobService;
  private initialized = false;

  static getInstance(): AdMobService {
    if (!AdMobService.instance) {
      AdMobService.instance = new AdMobService();
    }
    return AdMobService.instance;
  }

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  getBannerUnitId(fallback?: string): string | undefined {
    const fromEnv = process.env.EXPO_PUBLIC_ADMOB_UNIT_ID;
    return fromEnv || fallback || 'ca-app-pub-7625170441500776/3430663176';
  }

  async showRewarded(_onReward?: (type?: string, amount?: number) => void): Promise<boolean> {
    await this.initialize();
    if (Platform.OS === 'web') return false;
    // 보상형 단위 ID/구현은 스토어 제출 후 활성화
    return false;
  }

  async showInterstitial(): Promise<boolean> {
    await this.initialize();
    if (Platform.OS === 'web') return false;
    return false;
  }
}

export default AdMobService;
