import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'has_completed_onboarding';
const PRIVACY_CONSENT_KEY = 'privacy_consent_accepted';
const ATT_ASKED_KEY = 'att_permission_asked';
const TUTORIAL_KEY = 'mongi_tutorial_version';
const TUTORIAL_VERSION = '1';

export class OnboardingService {
  static async hasCompletedOnboarding(): Promise<boolean> {
    const entries = await AsyncStorage.multiGet([ONBOARDING_KEY, TUTORIAL_KEY]);
    return entries[0][1] === 'true' && entries[1][1] === TUTORIAL_VERSION;
  }

  static async completeOnboarding(): Promise<void> {
    await AsyncStorage.multiSet([[ONBOARDING_KEY, 'true'], [TUTORIAL_KEY, TUTORIAL_VERSION]]);
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
    await AsyncStorage.multiRemove([ONBOARDING_KEY, PRIVACY_CONSENT_KEY, ATT_ASKED_KEY, TUTORIAL_KEY]);
  }
}
