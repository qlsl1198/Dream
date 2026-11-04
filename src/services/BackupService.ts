import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { DreamStorage } from './DreamStorage';
import { MemoryStorage } from './MemoryStorage';
import { FeedbackService } from './FeedbackService';
import { APP_CONFIG } from '../constants/AppConfig';
import { parseBackup, escapeHTML } from './BackupValidation';
import { withStorageLock } from './StorageQueue';

export class BackupService {
  static async createBackup() {
    const [dreams, memories] = await Promise.all([DreamStorage.getDreams(), MemoryStorage.getMemories()]);
    return { dreams, memories, version: APP_CONFIG.version, schemaVersion: 2, exportDate: new Date().toISOString() };
  }

  private static async exportFile(extension: string, content: string): Promise<string> {
    if (!FileSystem.cacheDirectory) throw new Error('파일 저장소를 사용할 수 없습니다.');
    const directory = FileSystem.cacheDirectory + 'dreamlog-exports/';
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    const uri = directory + 'dreamlog-' + Date.now() + '.' + extension;
    await FileSystem.writeAsStringAsync(uri, content);
    return uri;
  }

  static async exportToJSON(): Promise<string> {
    return this.exportFile('json', JSON.stringify(await this.createBackup(), null, 2));
  }

  static async exportToHTML(): Promise<string> {
    const backup = await this.createBackup();
    const body = backup.dreams.map(d => '<article><h2>' + escapeHTML(d.date) +
      '</h2><p>' + escapeHTML(d.content) + '</p><p>' + escapeHTML(d.interpretation) + '</p></article>').join('');
    return this.exportFile('html', '<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>드림로그 기록</title><style>body{font-family:system-ui;padding:24px;max-width:720px;margin:auto}article{border-bottom:1px solid #ccc;padding:20px 0}p{white-space:pre-wrap;line-height:1.6}</style><h1>드림로그 꿈 기록</h1>' + body + '</html>');
  }

  static async shareBackup(uri: string): Promise<void> {
    if (!(await Sharing.isAvailableAsync())) throw new Error('이 기기에서 파일 공유를 사용할 수 없습니다.');
    try { await Sharing.shareAsync(uri); }
    finally { await FileSystem.deleteAsync(uri, { idempotent: true }); }
  }

  /** Validates first; merges by id and preserves existing records on conflict. */
  static async importFromJSON(uri: string): Promise<void> {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists || (info.size ?? 0) > 10 * 1024 * 1024) throw new Error('10MB 이하의 JSON 백업을 선택해주세요.');
    const backup = parseBackup(await FileSystem.readAsStringAsync(uri));
    await withStorageLock(async () => {
      const keys = ['dream_records', 'memory_records'];
      const previous = await AsyncStorage.multiGet(keys);
      const dreams = await DreamStorage.getDreams();
      const memories = await MemoryStorage.getMemories();
      const merge = <T extends { id: string }>(incoming: T[], existing: T[]) =>
        Array.from(new Map([...incoming, ...existing].map(item => [item.id, item])).values());
      try {
        await AsyncStorage.multiSet([
          ['dream_records', JSON.stringify(merge(backup.dreams, dreams))],
          ['memory_records', JSON.stringify(merge(backup.memories, memories))],
        ]);
      } catch (error) {
        await AsyncStorage.multiSet(previous.map(([key, value]) => [key, value ?? '[]']));
        throw error;
      }
    });
  }

  static async getBackupInfo() {
    const [backup, feedback, lastBackupDate] = await Promise.all([this.createBackup(), FeedbackService.getFeedback(), AsyncStorage.getItem('lastBackupDate')]);
    return { totalDreams: backup.dreams.length, totalFeedback: feedback.length, lastBackupDate, backupSize: (JSON.stringify(backup).length / 1024).toFixed(2) + ' KB' };
  }

  static async saveLastBackupDate(): Promise<void> { await AsyncStorage.setItem('lastBackupDate', new Date().toISOString()); }
}
