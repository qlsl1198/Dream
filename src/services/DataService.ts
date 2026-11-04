import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { NotificationService } from './NotificationService';
import { withStorageLock } from './StorageQueue';

export const USER_DATA_KEYS = [
  'dream_records', 'memory_records', 'dream_feedback', 'app_suggestions',
  'dream_streak_meta', 'lastBackupDate', 'dream_draft', 'theme',
  'notification_settings', 'has_completed_onboarding',
  'privacy_consent_accepted', 'att_permission_asked',
];

export class DataService {
  static async clearAll(): Promise<void> {
    await NotificationService.cancelAllNotifications();
    await withStorageLock(async () => {
      await AsyncStorage.multiRemove(USER_DATA_KEYS);
      // Only the app-owned export directory; never touch other user files.
      if (FileSystem.cacheDirectory) {
        await FileSystem.deleteAsync(FileSystem.cacheDirectory + 'dreamlog-exports/', { idempotent: true });
      }
    });
  }
}
