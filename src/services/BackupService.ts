import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { DreamStorage, DreamRecord } from './DreamStorage';
import { FeedbackService, DreamFeedback } from './FeedbackService';

export interface BackupData {
  dreams: DreamRecord[];
  feedback: DreamFeedback[];
  settings: {
    theme: string;
    notifications: any;
  };
  exportDate: string;
  version: string;
}

export class BackupService {
  static async createBackup(): Promise<BackupData> {
    try {
      const dreams = await DreamStorage.getDreams();
      const feedback = await FeedbackService.getFeedback();
      
      // 설정 데이터 가져오기
      const theme = await AsyncStorage.getItem('theme') || 'light';
      const notificationSettings = await AsyncStorage.getItem('notification_settings') || '{}';

      const backupData: BackupData = {
        dreams,
        feedback,
        settings: {
          theme,
          notifications: JSON.parse(notificationSettings),
        },
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };

      return backupData;
    } catch (error) {
      console.error('백업 생성 오류:', error);
      throw new Error('백업을 생성하는 중 오류가 발생했습니다.');
    }
  }

  static async exportToJSON(): Promise<string> {
    try {
      const backupData = await this.createBackup();
      const jsonString = JSON.stringify(backupData, null, 2);
      
      const fileName = `dream_backup_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, jsonString);
      
      return fileUri;
    } catch (error) {
      console.error('JSON 내보내기 오류:', error);
      throw new Error('JSON 파일을 내보내는 중 오류가 발생했습니다.');
    }
  }

  static async exportToPDF(): Promise<string> {
    try {
      const backupData = await this.createBackup();
      
      // 간단한 HTML 형식으로 변환
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>꿈 기록 백업</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .dream { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            .dream-date { font-weight: bold; color: #666; }
            .dream-content { margin: 10px 0; }
            .dream-emotion { color: #007bff; }
            .dream-interpretation { background-color: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌙 꿈 기록 백업</h1>
            <p>내보내기 날짜: ${new Date(backupData.exportDate).toLocaleDateString('ko-KR')}</p>
            <p>총 꿈 기록: ${backupData.dreams.length}개</p>
          </div>
      `;

      backupData.dreams.forEach((dream, index) => {
        htmlContent += `
          <div class="dream">
            <div class="dream-date">${new Date(dream.date).toLocaleDateString('ko-KR')}</div>
            <div class="dream-content"><strong>꿈 내용:</strong> ${dream.content}</div>
            <div class="dream-emotion"><strong>감정:</strong> ${dream.emotion}</div>
            <div class="dream-interpretation">
              <strong>해석:</strong> ${dream.interpretation}
            </div>
            ${dream.recommendations ? `
              <div><strong>추천사항:</strong> ${dream.recommendations.join(', ')}</div>
            ` : ''}
          </div>
        `;
      });

      htmlContent += `
        </body>
        </html>
      `;

      const fileName = `dream_backup_${new Date().toISOString().split('T')[0]}.html`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, htmlContent);
      
      return fileUri;
    } catch (error) {
      console.error('PDF 내보내기 오류:', error);
      throw new Error('PDF 파일을 내보내는 중 오류가 발생했습니다.');
    }
  }

  static async shareBackup(fileUri: string): Promise<void> {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        throw new Error('공유 기능을 사용할 수 없습니다.');
      }
    } catch (error) {
      console.error('백업 공유 오류:', error);
      throw new Error('백업을 공유하는 중 오류가 발생했습니다.');
    }
  }

  static async importFromJSON(fileUri: string): Promise<void> {
    try {
      const jsonString = await FileSystem.readAsStringAsync(fileUri);
      const backupData: BackupData = JSON.parse(jsonString);

      // 데이터 검증
      if (!backupData.dreams || !Array.isArray(backupData.dreams)) {
        throw new Error('잘못된 백업 파일 형식입니다.');
      }

      // 기존 데이터 백업
      const existingDreams = await DreamStorage.getDreams();
      const existingFeedback = await FeedbackService.getFeedback();

      try {
        // 새 데이터로 복원
        await AsyncStorage.setItem('dream_records', JSON.stringify(backupData.dreams));
        await AsyncStorage.setItem('dream_feedback', JSON.stringify(backupData.feedback));
        
        if (backupData.settings.theme) {
          await AsyncStorage.setItem('theme', backupData.settings.theme);
        }
        
        if (backupData.settings.notifications) {
          await AsyncStorage.setItem('notification_settings', JSON.stringify(backupData.settings.notifications));
        }

        console.log('데이터 복원이 완료되었습니다.');
      } catch (restoreError) {
        // 복원 실패 시 기존 데이터로 되돌리기
        await AsyncStorage.setItem('dream_records', JSON.stringify(existingDreams));
        await AsyncStorage.setItem('dream_feedback', JSON.stringify(existingFeedback));
        throw restoreError;
      }
    } catch (error) {
      console.error('백업 가져오기 오류:', error);
      throw new Error('백업을 가져오는 중 오류가 발생했습니다.');
    }
  }

  static async getBackupInfo(): Promise<{
    totalDreams: number;
    totalFeedback: number;
    lastBackupDate: string | null;
    backupSize: string;
  }> {
    try {
      const dreams = await DreamStorage.getDreams();
      const feedback = await FeedbackService.getFeedback();
      
      const lastBackupDate = await AsyncStorage.getItem('lastBackupDate');
      
      const backupData = await this.createBackup();
      const jsonString = JSON.stringify(backupData);
      const sizeInBytes = unescape(encodeURIComponent(jsonString)).length;
      const sizeInKB = (sizeInBytes / 1024).toFixed(2);

      return {
        totalDreams: dreams.length,
        totalFeedback: feedback.length,
        lastBackupDate,
        backupSize: `${sizeInKB} KB`,
      };
    } catch (error) {
      console.error('백업 정보 조회 오류:', error);
      return {
        totalDreams: 0,
        totalFeedback: 0,
        lastBackupDate: null,
        backupSize: '0 KB',
      };
    }
  }

  static async saveLastBackupDate(): Promise<void> {
    try {
      await AsyncStorage.setItem('lastBackupDate', new Date().toISOString());
    } catch (error) {
      console.error('백업 날짜 저장 오류:', error);
    }
  }
}
