import { Platform } from 'react-native';
// import mobileAds, { InterstitialAd, RewardedAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

/**
 * AdMob 서비스 래퍼
 * - 배너는 expo-ads-admob 의 AdMobBanner 컴포넌트 사용
 * - 전면/보상형은 본 서비스로 로드/표시
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
    if (this.initialized) return;
    // AdMob 초기화 임시 비활성화 (모듈 문제 해결 후 활성화)
    // try {
    //   await mobileAds().initialize();
    // } catch {}
    this.initialized = true;
  }

  getBannerUnitId(fallback?: string): string | undefined {
    const fromEnv = process.env.EXPO_PUBLIC_ADMOB_UNIT_ID;
    return fromEnv || fallback || 'ca-app-pub-7625170441500776/3430663176';
  }

  private getRewardedUnitId(): string | undefined {
    return process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID;
  }

  private getInterstitialUnitId(): string | undefined {
    return process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID || 'ca-app-pub-7625170441500776/4500202263';
  }

  async showRewarded(onReward?: (type?: string, amount?: number) => void): Promise<boolean> {
    await this.initialize();
    const unitId = this.getRewardedUnitId();
    if (!unitId || Platform.OS === 'web') return false;

    try {
      AdMobRewarded.removeAllListeners();
      onReward && AdMobRewarded.addEventListener('rewarded', ({ type, amount }) => onReward(type, amount));
      await AdMobRewarded.setAdUnitID(unitId);
      await AdMobRewarded.requestAdAsync({ servePersonalizedAds: true });
      await AdMobRewarded.showAdAsync();
      return true;
    } catch (e) {
      return false;
    }
  }

  async showInterstitial(): Promise<boolean> {
    await this.initialize();
    const unitId = this.getInterstitialUnitId();
    if (!unitId || Platform.OS === 'web') return false;
    try {
      await AdMobInterstitial.setAdUnitID(unitId);
      await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
      await AdMobInterstitial.showAdAsync();
      return true;
    } catch (e) {
      return false;
    }
  }
}

export default AdMobService;


