import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  Modal,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { NotificationService, NotificationSettings } from '../services/NotificationService';
import { DataService } from '../services/DataService';
import * as DocumentPicker from 'expo-document-picker';

import { BackupService } from '../services/BackupService';
import { ShareService } from '../services/ShareService';
import { APP_CONFIG } from '../constants/AppConfig';
import FeedbackModal from '../components/FeedbackModal';
import LegalScreen from './LegalScreen';
import MemoryScreen from './MemoryScreen';
import DreamPageHeader from '../components/DreamPageHeader';
import { dreamLayout } from '../constants/DreamDesign';
import Switch from '../components/DreamSwitch';

function Row({ icon, label, description, onPress, danger, right }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; description?: string;
  onPress?: () => void; danger?: boolean; right?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const content = <>
    <View style={styles.itemLeft}>
      <Ionicons name={icon} size={21} color={danger ? colors.error : colors.accent} />
      <View style={styles.itemText}>
        <Text style={[styles.itemLabel, { color: danger ? colors.error : colors.text }]}>{label}</Text>
        {description ? <Text style={[styles.itemDesc, { color: colors.textSecondary }]}>{description}</Text> : null}
      </View>
    </View>
    {right || (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} /> : null)}
  </>;
  const style = [styles.item, { borderColor: colors.border }];
  return onPress ? <TouchableOpacity accessibilityRole="button" style={style} onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity> : <View style={style}>{content}</View>;
}

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
              if (/^([01]?\d|2[0-3]):[0-5]\d$/.test(timeString.trim()) && Number.isInteger(hour) && Number.isInteger(minute) && hour >= 0 && minute >= 0) {
                const newSettings = { ...notificationSettings, hour, minute };
                try {
                  await NotificationService.saveNotificationSettings(newSettings);
                  setNotificationSettings(newSettings);
                } catch { Alert.alert('알림', '알림 시간을 저장하지 못했습니다.'); }
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
    Alert.alert('모든 데이터 삭제', '꿈·회상·피드백·설정과 앱이 만든 임시 백업을 삭제하고 알림을 끕니다. 외부에 내보낸 백업은 직접 삭제해주세요. 되돌릴 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await DataService.clearAll();
            await loadNotificationSettings();
            Alert.alert('완료', '앱에 저장된 데이터가 삭제되었습니다.');
          } catch { Alert.alert('삭제 실패', '일부 데이터를 삭제하지 못했습니다. 다시 시도해주세요.'); }
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
            const fileUri = await BackupService.exportToHTML();
            await BackupService.shareBackup(fileUri);
            await BackupService.saveLastBackupDate();
          } catch {
            Alert.alert('오류', '내보내기 중 오류가 발생했습니다.');
          }
        },
      },
    ]);
  };

  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'public.json'], copyToCacheDirectory: true });
      if (result.canceled) return;
      const file = result.assets[0];
      Alert.alert('백업 가져오기', '현재 기록을 보존하면서 백업 기록을 추가합니다. 같은 ID의 기록은 현재 내용을 유지합니다.', [
        { text: '취소', style: 'cancel' },
        { text: '가져오기', onPress: async () => {
          try {
            await BackupService.importFromJSON(file.uri);
            Alert.alert('완료', '백업 기록을 가져왔습니다.');
          } catch (error) { Alert.alert('가져오기 실패', error instanceof Error ? error.message : '올바른 백업을 선택해주세요.'); }
        } },
      ]);
    } catch { Alert.alert('파일 선택 실패', '파일을 열 수 없습니다. 다시 시도해주세요.'); }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <DreamPageHeader title="나만의 공간" subtitle="편안한 기록을 위한 작은 설정" />

      <ScrollView contentContainerStyle={[dreamLayout.body, { paddingTop: 0 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.companionIntro}>
          <Image source={require('../../assets/dream-world/mongi.png')} style={styles.rabbit} resizeMode="contain" accessible={false} />
          <View style={{ flex: 1 }}><Text style={[styles.introTitle, { color: colors.text }]}>몽이와 함께하는 밤</Text><Text style={[styles.introText, { color: colors.textSecondary }]}>꿈은 이 기기 안에 머물러요</Text></View>
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>화면</Text>
        <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Row
          icon={theme === 'dark' ? 'moon' : 'sunny'}
          label="다크 모드"
          description={theme === 'dark' ? '어두운 테마 사용 중' : '밝은 테마 사용 중'}
          right={
            <Switch
              accessibilityLabel="다크 모드"
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#fff"
            />
          }
        />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>알림</Text>
        <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
              accessibilityLabel="꿈 기록 알림"
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.border, true: colors.accent }}
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

        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>데이터 관리</Text>
        <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Row
          icon="search-outline"
          label="회상 일기"
          description="기억나는 단서를 기록하고 정리하기"
          onPress={() => setMemoryVisible(true)}
        />
        <Row icon="download-outline" label="데이터 내보내기" onPress={handleExportData} />
        <Row icon="cloud-upload-outline" label="백업 가져오기" onPress={handleImportData} />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>지원</Text>
        <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Row icon="chatbubble-outline" label="개발자에게 건의" onPress={() => setFeedbackModalVisible(true)} />
        {APP_CONFIG.storeUrl.ios ? <Row icon="star-outline" label="앱 평가하기" onPress={() => ShareService.rateApp()} /> : null}
        <Row icon="share-outline" label="앱 공유하기" onPress={() => ShareService.shareApp()} />
        <Row icon="mail-outline" label="문의하기" onPress={() => ShareService.contactSupport()} />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>정보</Text>
        <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
        </View>
        <View style={[styles.dangerGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Row icon="trash-outline" label="모든 데이터 삭제" danger onPress={handleClearAllData} />
        </View>
        <Text style={[styles.version, { color: colors.textSecondary }]}>{APP_CONFIG.name} · v{APP_CONFIG.version}</Text>
      </ScrollView>

      <FeedbackModal visible={feedbackModalVisible} onClose={() => setFeedbackModalVisible(false)} />

      <Modal visible={!!legalType} animationType="slide" presentationStyle="pageSheet">
        {legalType && <LegalScreen type={legalType} onClose={() => setLegalType(null)} />}
      </Modal>

      <Modal visible={memoryVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={[styles.modalBar, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setMemoryVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>회상 일기</Text>
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
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 12 },
  group: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 16, overflow: 'hidden' },
  dangerGroup: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 16, marginTop: 36, overflow: 'hidden' },
  companionIntro: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingBottom: 4 },
  rabbit: { width: 86, height: 100 },
  introTitle: { fontSize: 19, fontWeight: '700', lineHeight: 27 },
  introText: { fontSize: 13, lineHeight: 21, marginTop: 6 },
  version: { textAlign: 'center', fontSize: 12, marginTop: 24 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemText: { marginLeft: 12, flex: 1 },
  itemLabel: { fontSize: 15, fontWeight: '600' },
  itemDesc: { fontSize: 12, lineHeight: 19, marginTop: 4 },
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
