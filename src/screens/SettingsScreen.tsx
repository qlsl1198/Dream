import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Switch,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { NotificationService, NotificationSettings } from '../services/NotificationService';
import { DreamStorage } from '../services/DreamStorage';
import { MemoryStorage } from '../services/MemoryStorage';
import { BackupService } from '../services/BackupService';
import { ShareService } from '../services/ShareService';
import { APP_CONFIG } from '../constants/AppConfig';
import FeedbackModal from '../components/FeedbackModal';
import DonationModal from '../components/DonationModal';
import LegalScreen from './LegalScreen';
import MemoryScreen from './MemoryScreen';

export default function SettingsScreen() {
  const { theme, toggleTheme, colors } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: false,
    hour: 22,
    minute: 0,
    interpretationReminder: false,
    diaryReminder: false,
    weeklyAnalysis: false,
    tips: false,
  });
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [donationModalVisible, setDonationModalVisible] = useState(false);
  const [legalType, setLegalType] = useState<'privacy' | 'terms' | null>(null);
  const [memoryVisible, setMemoryVisible] = useState(false);

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
          Alert.alert('알림 권한 필요', '설정 앱에서 알림 권한을 허용해주세요.');
          return;
        }
      }

      const newSettings = { ...notificationSettings, enabled };
      await NotificationService.saveNotificationSettings(newSettings);
      setNotificationSettings(newSettings);
      setNotificationsEnabled(enabled);
    } catch {
      Alert.alert('오류', '알림 설정 중 오류가 발생했습니다.');
    }
  };

  const updateReminderFlag = async (
    key: keyof Pick<
      NotificationSettings,
      'interpretationReminder' | 'diaryReminder' | 'weeklyAnalysis' | 'tips'
    >,
    value: boolean
  ) => {
    const newSettings = { ...notificationSettings, [key]: value, enabled: true };
    try {
      if (!notificationsEnabled) {
        const ok = await NotificationService.requestPermissions();
        if (!ok) {
          Alert.alert('알림 권한 필요', '알림 권한을 허용해주세요.');
          return;
        }
        setNotificationsEnabled(true);
      }
      await NotificationService.saveNotificationSettings(newSettings);
      setNotificationSettings(newSettings);
    } catch {
      Alert.alert('오류', '리마인더 설정 중 오류가 발생했습니다.');
    }
  };

  const handleTimeSetting = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        '알림 시간 설정',
        '예: 22:30',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '설정',
            onPress: async (timeString) => {
              if (!timeString) return;
              const [hour, minute] = timeString.split(':').map(Number);
              if (Number.isFinite(hour) && Number.isFinite(minute) && hour <= 23 && minute <= 59) {
                const newSettings = { ...notificationSettings, hour, minute };
                await NotificationService.saveNotificationSettings(newSettings);
                setNotificationSettings(newSettings);
              } else {
                Alert.alert('잘못된 형식', '예: 22:30');
              }
            },
          },
        ],
        'plain-text',
        `${notificationSettings.hour.toString().padStart(2, '0')}:${notificationSettings.minute
          .toString()
          .padStart(2, '0')}`
      );
    } else {
      Alert.alert('알림 시간', '기본 알림은 매일 22:00입니다. iOS에서는 직접 시간을 입력할 수 있습니다.');
    }
  };

  const handleClearAllData = () => {
    Alert.alert('모든 데이터 삭제', '꿈·기억 기록이 모두 삭제됩니다. 되돌릴 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await DreamStorage.clearAllDreams();
          await MemoryStorage.clearAll();
          Alert.alert('완료', '모든 데이터가 삭제되었습니다.');
        },
      },
    ]);
  };

  const handleExportData = async () => {
    Alert.alert('데이터 내보내기', '형식을 선택하세요.', [
      { text: '취소', style: 'cancel' },
      {
        text: 'JSON',
        onPress: async () => {
          try {
            const fileUri = await BackupService.exportToJSON();
            await BackupService.shareBackup(fileUri);
            await BackupService.saveLastBackupDate();
          } catch {
            Alert.alert('오류', '내보내기 중 오류가 발생했습니다.');
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
          } catch {
            Alert.alert('오류', '내보내기 중 오류가 발생했습니다.');
          }
        },
      },
    ]);
  };

  const Row = ({
    icon,
    label,
    description,
    onPress,
    danger,
    right,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    description?: string;
    onPress?: () => void;
    danger?: boolean;
    right?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress && !right}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={22} color={danger ? colors.error : colors.primary} />
        <View style={styles.itemText}>
          <Text style={[styles.itemLabel, { color: danger ? colors.error : colors.text }]}>{label}</Text>
          {description ? (
            <Text style={[styles.itemDesc, { color: colors.textSecondary }]}>{description}</Text>
          ) : null}
        </View>
      </View>
      {right || (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} /> : null)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>설정</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {APP_CONFIG.name} v{APP_CONFIG.version}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>환경</Text>
        <Row
          icon={theme === 'dark' ? 'moon' : 'sunny'}
          label="다크 모드"
          description={theme === 'dark' ? '어두운 테마 사용 중' : '밝은 테마 사용 중'}
          right={
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          }
        />
        <Row
          icon="notifications-outline"
          label="꿈 기록 알림"
          description={
            notificationsEnabled
              ? `매일 ${notificationSettings.hour.toString().padStart(2, '0')}:${notificationSettings.minute
                  .toString()
                  .padStart(2, '0')}`
              : '꺼짐'
          }
          right={
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          }
        />
        {notificationsEnabled && (
          <>
            <Row icon="time-outline" label="알림 시간 변경" onPress={handleTimeSetting} />
            <Row
              icon="sparkles-outline"
              label="해석 리마인더"
              description="매일 20:00"
              right={
                <Switch
                  value={notificationSettings.interpretationReminder}
                  onValueChange={(v) => updateReminderFlag('interpretationReminder', v)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                />
              }
            />
            <Row
              icon="book-outline"
              label="일기 리마인더"
              description="매일 21:00"
              right={
                <Switch
                  value={notificationSettings.diaryReminder}
                  onValueChange={(v) => updateReminderFlag('diaryReminder', v)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                />
              }
            />
            <Row
              icon="analytics-outline"
              label="주간 분석 리마인더"
              description="월요일 09:00"
              right={
                <Switch
                  value={notificationSettings.weeklyAnalysis}
                  onValueChange={(v) => updateReminderFlag('weeklyAnalysis', v)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                />
              }
            />
          </>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>도구</Text>
        <Row
          icon="search-outline"
          label="기억 복원"
          description="흐릿한 장면을 질문으로 되살리기"
          onPress={() => setMemoryVisible(true)}
        />
        <Row icon="download-outline" label="데이터 내보내기" onPress={handleExportData} />
        <Row
          icon="trash-outline"
          label="모든 데이터 삭제"
          danger
          onPress={handleClearAllData}
        />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>지원</Text>
        <Row icon="chatbubble-outline" label="개발자에게 건의" onPress={() => setFeedbackModalVisible(true)} />
        <Row icon="heart-outline" label="개발자에게 후원" onPress={() => setDonationModalVisible(true)} />
        <Row icon="star-outline" label="앱 평가하기" onPress={() => ShareService.rateApp()} />
        <Row icon="share-outline" label="앱 공유하기" onPress={() => ShareService.shareApp()} />
        <Row icon="mail-outline" label="문의하기" onPress={() => ShareService.contactSupport()} />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>법적 고지</Text>
        <Row icon="document-text-outline" label="개인정보 처리방침" onPress={() => setLegalType('privacy')} />
        <Row icon="shield-checkmark-outline" label="이용약관" onPress={() => setLegalType('terms')} />
        <Row
          icon="information-circle-outline"
          label="앱 정보"
          description={`${APP_CONFIG.name} ${APP_CONFIG.version}`}
          onPress={() =>
            Alert.alert(
              APP_CONFIG.name,
              `버전 ${APP_CONFIG.version}\n${APP_CONFIG.tagline}\n\n꿈 해석은 참고용이며 의료 조언이 아닙니다.\n문의: ${APP_CONFIG.supportEmail}`
            )
          }
        />
      </ScrollView>

      <FeedbackModal visible={feedbackModalVisible} onClose={() => setFeedbackModalVisible(false)} />
      <DonationModal visible={donationModalVisible} onClose={() => setDonationModalVisible(false)} />

      <Modal visible={!!legalType} animationType="slide" presentationStyle="pageSheet">
        {legalType && <LegalScreen type={legalType} onClose={() => setLegalType(null)} />}
      </Modal>

      <Modal visible={memoryVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={[styles.modalBar, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setMemoryVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>기억 복원</Text>
            <View style={{ width: 24 }} />
          </View>
          <MemoryScreen />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  headerSubtitle: { fontSize: 13 },
  content: { padding: 20, paddingTop: 8, paddingBottom: 40 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginTop: 12, marginBottom: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemText: { marginLeft: 12, flex: 1 },
  itemLabel: { fontSize: 15, fontWeight: '600' },
  itemDesc: { fontSize: 12, marginTop: 2 },
  modalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 16, fontWeight: '700' },
});
