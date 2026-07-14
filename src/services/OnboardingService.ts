import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'has_completed_onboarding';
const PRIVACY_CONSENT_KEY = 'privacy_consent_accepted';
const ATT_ASKED_KEY = 'att_permission_asked';

export class OnboardingService {
  static async hasCompletedOnboarding(): Promise<boolean> {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  }

  static async completeOnboarding(): Promise<void> {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  }

  static async hasAcceptedPrivacy(): Promise<boolean> {
    const value = await AsyncStorage.getItem(PRIVACY_CONSENT_KEY);
    return value === 'true';
  }

  static async acceptPrivacy(): Promise<void> {
    await AsyncStorage.setItem(PRIVACY_CONSENT_KEY, 'true');
  }

  static async hasAskedATT(): Promise<boolean> {
    const value = await AsyncStorage.getItem(ATT_ASKED_KEY);
    return value === 'true';
  }

  static async markATTAsked(): Promise<void> {
    await AsyncStorage.setItem(ATT_ASKED_KEY, 'true');
  }

  static async reset(): Promise<void> {
    await AsyncStorage.multiRemove([ONBOARDING_KEY, PRIVACY_CONSENT_KEY, ATT_ASKED_KEY]);
  }
}
