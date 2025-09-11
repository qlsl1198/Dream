import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { NotificationService, NotificationSettings } from '../services/NotificationService';
import { DreamStorage } from '../services/DreamStorage';
import { BackupService } from '../services/BackupService';
import { FeedbackService } from '../services/FeedbackService';
import FeedbackModal from '../components/FeedbackModal';
import DonationModal from '../components/DonationModal';

export default function SettingsScreen() {
  const { theme, toggleTheme, colors } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = React.useState(true);
  const [notificationSettings, setNotificationSettings] = React.useState<NotificationSettings>({
    enabled: false,
    hour: 22,
    minute: 0,
  });
  const [feedbackModalVisible, setFeedbackModalVisible] = React.useState(false);
  const [donationModalVisible, setDonationModalVisible] = React.useState(false);

  React.useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const settings = await NotificationService.getNotificationSettings();
      setNotificationSettings(settings);
      setNotificationsEnabled(settings.enabled);
    } catch (error) {
      console.error('알림 설정 불러오기 오류:', error);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    try {
      if (enabled) {
        const hasPermission = await NotificationService.requestPermissions();
        if (!hasPermission) {
          Alert.alert('알림 권한 필요', '알림을 받으려면 알림 권한이 필요합니다.');
          return;
        }
      }

      const newSettings = { ...notificationSettings, enabled };
      await NotificationService.saveNotificationSettings(newSettings);
      setNotificationSettings(newSettings);
      setNotificationsEnabled(enabled);
    } catch (error) {
      console.error('알림 설정 오류:', error);
      Alert.alert('오류', '알림 설정 중 오류가 발생했습니다.');
    }
  };

  const handleTimeSetting = () => {
    Alert.prompt(
      '알림 시간 설정',
      '꿈 기록 알림을 받을 시간을 설정하세요 (예: 22:30)',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '설정',
          onPress: async (timeString) => {
            if (timeString) {
              const [hour, minute] = timeString.split(':').map(Number);
              if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
                try {
                  const newSettings = { ...notificationSettings, hour, minute };
                  await NotificationService.saveNotificationSettings(newSettings);
                  setNotificationSettings(newSettings);
                } catch (error) {
                  console.error('시간 설정 오류:', error);
                  Alert.alert('오류', '시간 설정 중 오류가 발생했습니다.');
                }
              } else {
                Alert.alert('잘못된 형식', '올바른 시간 형식으로 입력해주세요. (예: 22:30)');
              }
            }
          },
        },
      ],
      'plain-text',
      `${notificationSettings.hour.toString().padStart(2, '0')}:${notificationSettings.minute.toString().padStart(2, '0')}`
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      '모든 데이터 삭제',
      '모든 꿈 기록과 기억 복원 기록이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await DreamStorage.clearAllDreams();
              Alert.alert('완료', '모든 데이터가 삭제되었습니다.');
            } catch (error) {
              console.error('데이터 삭제 오류:', error);
              Alert.alert('오류', '데이터 삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    Alert.alert(
      '데이터 내보내기',
      '어떤 형식으로 내보내시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: 'JSON',
          onPress: async () => {
            try {
              const fileUri = await BackupService.exportToJSON();
              await BackupService.shareBackup(fileUri);
              await BackupService.saveLastBackupDate();
              Alert.alert('성공', '데이터가 JSON 형식으로 내보내졌습니다.');
            } catch (error) {
              console.error('JSON 내보내기 오류:', error);
              Alert.alert('오류', '데이터 내보내기 중 오류가 발생했습니다.');
            }
          },
        },
        {
          text: 'HTML',
          onPress: async () => {
            try {
              const fileUri = await BackupService.exportToPDF();
              await BackupService.shareBackup(fileUri);
              await BackupService.saveLastBackupDate();
              Alert.alert('성공', '데이터가 HTML 형식으로 내보내졌습니다.');
            } catch (error) {
              console.error('HTML 내보내기 오류:', error);
              Alert.alert('오류', '데이터 내보내기 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleImportData = () => {
    Alert.alert(
      '데이터 가져오기',
      'JSON 백업 파일을 가져오시겠습니까? 기존 데이터는 백업됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '가져오기',
          onPress: () => {
            // 실제 구현에서는 파일 선택 기능이 필요합니다
            Alert.alert('알림', '파일 선택 기능은 추후 구현될 예정입니다.');
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      '꿈 해석 앱 정보',
      '버전: 1.0.0\n개발자: Dream Team\n\nAI 기반 꿈 해석 및 기억 복원 앱입니다.',
      [{ text: '확인' }]
    );
  };

  const renderSettingsSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>설정</Text>
      
      <View style={[styles.settingItem, { 
        backgroundColor: colors.surface,
        borderColor: colors.border 
      }]}>
        <View style={styles.settingContent}>
          <Ionicons name={theme === 'dark' ? 'moon' : 'sunny'} size={24} color={colors.primary} />
          <View style={styles.settingText}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>다크 모드</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              {theme === 'dark' ? '어두운 테마 사용 중' : '밝은 테마 사용 중'}
            </Text>
          </View>
        </View>
        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={theme === 'dark' ? '#fff' : colors.textSecondary}
        />
      </View>
      
      <View style={[styles.settingItem, { 
        backgroundColor: colors.surface,
        borderColor: colors.border 
      }]}>
        <View style={styles.settingContent}>
          <Ionicons name="notifications-outline" size={24} color={colors.primary} />
          <View style={styles.settingText}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>꿈 기록 알림</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              {notificationsEnabled 
                ? `매일 ${notificationSettings.hour.toString().padStart(2, '0')}:${notificationSettings.minute.toString().padStart(2, '0')}에 알림`
                : '꿈 기록 알림 받기'
              }
            </Text>
          </View>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={handleNotificationToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={notificationsEnabled ? '#fff' : colors.textSecondary}
        />
      </View>

      {notificationsEnabled && (
        <>
          <TouchableOpacity 
            style={[styles.settingItem, { 
              backgroundColor: colors.surface,
              borderColor: colors.border 
            }]}
            onPress={handleTimeSetting}
          >
            <View style={styles.settingContent}>
              <Ionicons name="time-outline" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>꿈 기록 알림 시간</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  현재: {notificationSettings.hour.toString().padStart(2, '0')}:{notificationSettings.minute.toString().padStart(2, '0')}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, { 
              backgroundColor: colors.surface,
              borderColor: colors.border 
            }]}
            onPress={async () => {
              try {
                await NotificationService.scheduleInterpretationReminder(20, 0);
                Alert.alert('성공', '꿈 해석 리마인더가 설정되었습니다.');
              } catch (error) {
                Alert.alert('오류', '꿈 해석 리마인더 설정 중 오류가 발생했습니다.');
              }
            }}
          >
            <View style={styles.settingContent}>
              <Ionicons name="search-outline" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>꿈 해석 리마인더</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  매일 20:00에 꿈 해석 알림
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, { 
              backgroundColor: colors.surface,
              borderColor: colors.border 
            }]}
            onPress={async () => {
              try {
                await NotificationService.scheduleDiaryReminder(21, 0);
                Alert.alert('성공', '꿈 일기 리마인더가 설정되었습니다.');
              } catch (error) {
                Alert.alert('오류', '꿈 일기 리마인더 설정 중 오류가 발생했습니다.');
              }
            }}
          >
            <View style={styles.settingContent}>
              <Ionicons name="book-outline" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>꿈 일기 리마인더</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  매일 21:00에 꿈 일기 작성 알림
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, { 
              backgroundColor: colors.surface,
              borderColor: colors.border 
            }]}
            onPress={async () => {
              try {
                await NotificationService.scheduleWeeklyAnalysisReminder();
                Alert.alert('성공', '주간 꿈 분석 리마인더가 설정되었습니다.');
              } catch (error) {
                Alert.alert('오류', '주간 분석 리마인더 설정 중 오류가 발생했습니다.');
              }
            }}
          >
            <View style={styles.settingContent}>
              <Ionicons name="analytics-outline" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>주간 분석 리마인더</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  매주 월요일 09:00에 통계 확인 알림
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, { 
              backgroundColor: colors.surface,
              borderColor: colors.border 
            }]}
            onPress={async () => {
              try {
                await NotificationService.schedulePersonalizedTips();
                Alert.alert('성공', '개인화된 꿈 기록 팁이 설정되었습니다.');
              } catch (error) {
                Alert.alert('오류', '개인화된 팁 설정 중 오류가 발생했습니다.');
              }
            }}
          >
            <View style={styles.settingContent}>
              <Ionicons name="bulb-outline" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>꿈 기록 팁</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  매일 14:00에 유용한 꿈 기록 팁
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </>
      )}

      <View style={[styles.settingItem, { 
        backgroundColor: colors.surface,
        borderColor: colors.border 
      }]}>
        <View style={styles.settingContent}>
          <Ionicons name="analytics-outline" size={24} color={colors.primary} />
          <View style={styles.settingText}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>분석 데이터</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>앱 사용 통계 수집</Text>
          </View>
        </View>
        <Switch
          value={analyticsEnabled}
          onValueChange={setAnalyticsEnabled}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={analyticsEnabled ? '#fff' : colors.textSecondary}
        />
      </View>
    </View>
  );

  const renderDataSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>데이터 관리</Text>
      
      <TouchableOpacity style={[styles.menuItem, { 
        backgroundColor: colors.surface,
        borderColor: colors.border 
      }]} onPress={handleExportData}>
        <View style={styles.menuContent}>
          <Ionicons name="download-outline" size={24} color={colors.primary} />
          <Text style={[styles.menuLabel, { color: colors.text }]}>데이터 내보내기</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.menuItem, { 
        backgroundColor: colors.surface,
        borderColor: colors.border 
      }]} onPress={handleImportData}>
        <View style={styles.menuContent}>
          <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
          <Text style={[styles.menuLabel, { color: colors.text }]}>데이터 가져오기</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.menuItem, { 
        backgroundColor: colors.surface,
        borderColor: colors.border 
      }]} onPress={handleClearAllData}>
        <View style={styles.menuContent}>
          <Ionicons name="trash-outline" size={24} color={colors.error} />
          <Text style={[styles.menuLabel, { color: colors.error }]}>모든 데이터 삭제</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const renderAboutSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>정보</Text>
      
      <TouchableOpacity style={[styles.menuItem, { 
        backgroundColor: colors.surface,
        borderColor: colors.border 
      }]} onPress={handleAbout}>
        <View style={styles.menuContent}>
          <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
          <Text style={[styles.menuLabel, { color: colors.text }]}>앱 정보</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.menuItem, { 
        backgroundColor: colors.surface,
        borderColor: colors.border 
      }]}>
        <View style={styles.menuContent}>
          <Ionicons name="star-outline" size={24} color={colors.warning} />
          <Text style={[styles.menuLabel, { color: colors.text }]}>앱 평가하기</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.menuItem, { 
        backgroundColor: colors.surface,
        borderColor: colors.border 
      }]}>
        <View style={styles.menuContent}>
          <Ionicons name="share-outline" size={24} color={colors.primary} />
          <Text style={[styles.menuLabel, { color: colors.text }]}>앱 공유하기</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.menuItem, { 
          backgroundColor: colors.surface,
          borderColor: colors.border 
        }]} 
        onPress={() => setFeedbackModalVisible(true)}
      >
        <View style={styles.menuContent}>
          <Ionicons name="chatbubble-outline" size={24} color={colors.primary} />
          <Text style={[styles.menuLabel, { color: colors.text }]}>개발자에게 건의</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.menuItem, { 
          backgroundColor: colors.surface,
          borderColor: colors.border 
        }]} 
        onPress={() => setDonationModalVisible(true)}
      >
        <View style={styles.menuContent}>
          <Ionicons name="heart-outline" size={24} color="#FF6B6B" />
          <Text style={[styles.menuLabel, { color: colors.text }]}>개발자에게 후원</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>설정</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>앱 설정 및 데이터 관리</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {renderSettingsSection()}
        {renderDataSection()}
        {renderAboutSection()}
      </ScrollView>

      {/* 모달들 */}
      <FeedbackModal
        visible={feedbackModalVisible}
        onClose={() => setFeedbackModalVisible(false)}
      />
      <DonationModal
        visible={donationModalVisible}
        onClose={() => setDonationModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
});
