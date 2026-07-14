import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { DreamStorage, DreamRecord } from '../services/DreamStorage';
import { FeedbackService } from '../services/FeedbackService';
import { NetworkService } from '../services/NetworkService';
import { dreamInterpreter, DreamAnalysisResult } from '../services/DreamInterpreter';
import { StreakService, StreakInfo } from '../services/StreakService';
import { APP_CONFIG, DREAM_TYPES, EMOTIONS } from '../constants/AppConfig';
import type { DreamTypeKey } from '../constants/AppConfig';
import AdMobBanner from '../components/AdMobBanner';

export default function HomeScreen() {
  const { colors } = useTheme();
  const [dreamContent, setDreamContent] = useState('');
  const [emotion, setEmotion] = useState('');
  const [dreamType, setDreamType] = useState<DreamTypeKey>('normal');
  const [vividness, setVividness] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [tagsInput, setTagsInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<DreamAnalysisResult | null>(null);
  const [currentDreamId, setCurrentDreamId] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [streak, setStreak] = useState<StreakInfo | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    checkNetworkStatus();
    loadStreak();
  }, []);

  const loadStreak = async () => {
    setStreak(await StreakService.getStreakInfo());
  };

  const checkNetworkStatus = async () => {
    try {
      const networkService = NetworkService.getInstance();
      const isConnected = await networkService.checkInternetConnectivity();
      setIsOffline(!isConnected || !dreamInterpreter.hasApiKey());
    } catch {
      setIsOffline(true);
    }
  };

  const parseTags = () =>
    tagsInput
      .split(/[#,，,\s]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 8);

  const saveAndShowResult = async (result: DreamAnalysisResult) => {
    const now = new Date();
    const dreamId = now.getTime().toString();
    const dreamRecord: DreamRecord = {
      id: dreamId,
      content: dreamContent.trim(),
      emotion: emotion || 'neutral',
      interpretation: result.interpretation,
      date: now.toISOString().split('T')[0],
      createdAt: now.toISOString(),
      confidence: result.confidence,
      recommendations: result.recommendations,
      themes: result.themes,
      matchedSymbols: result.matchedSymbols,
      dreamType,
      vividness,
      sleepQuality,
      tags: parseTags(),
    };

    await DreamStorage.saveDream(dreamRecord);
    setCurrentDreamId(dreamId);
    setAnalysisResult(result);
    await loadStreak();
  };

  const handleAnalyzeDream = async () => {
    if (dreamContent.trim().length < APP_CONFIG.minDreamLength) {
      Alert.alert('알림', `꿈 내용을 ${APP_CONFIG.minDreamLength}자 이상 입력해주세요.`);
      return;
    }

    await checkNetworkStatus();
    const useOffline = isOffline;

    if (useOffline) {
      Alert.alert(
        dreamInterpreter.hasApiKey() ? '오프라인 상태' : '오프라인 해석',
        '오프라인 해석 엔진과 상징 사전으로 분석합니다.',
        [
          { text: '취소', style: 'cancel' },
          { text: '계속하기', onPress: () => runAnalysis(true) },
        ]
      );
      return;
    }

    runAnalysis(false);
  };

  const runAnalysis = async (offline: boolean) => {
    setIsAnalyzing(true);
    setLoadingProgress(0);
    setAnalysisResult(null);

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => (prev >= 90 ? 90 : prev + Math.random() * 12));
    }, 200);

    try {
      const result = await dreamInterpreter.analyzeDream(dreamContent, emotion, offline);
      clearInterval(progressInterval);
      setLoadingProgress(100);
      await saveAndShowResult(result);

      Alert.alert(
        offline ? '오프라인 해석 완료' : '꿈 해석 완료',
        '기록이 저장되었습니다. 아래에서 결과를 확인하세요.'
      );
      setDreamContent('');
      setEmotion('');
      setTagsInput('');
    } catch (error) {
      console.error('꿈 해석 오류:', error);
      clearInterval(progressInterval);
      setLoadingProgress(0);
      Alert.alert('오류', '꿈 해석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFeedback = async (isHelpful: boolean) => {
    if (!currentDreamId) return;
    try {
      await FeedbackService.saveInterpretationFeedback({
        dreamId: currentDreamId,
        isAccurate: isHelpful,
        helpfulness: isHelpful ? 5 : 1,
        timestamp: new Date().toISOString(),
      });
      Alert.alert('감사합니다', isHelpful ? '도움이 되었다니 기쁩니다!' : '더 나은 해석을 위해 반영할게요.');
    } catch (error) {
      console.error('피드백 저장 오류:', error);
    }
  };

  const ScorePicker = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (n: number) => void;
  }) => (
    <View style={styles.scoreBlock}>
      <Text style={[styles.scoreLabel, { color: colors.text }]}>
        {label} · {value}/10
      </Text>
      <View style={styles.scoreRow}>
        {[2, 4, 6, 8, 10].map((n) => (
          <TouchableOpacity
            key={n}
            style={[
              styles.scoreChip,
              {
                backgroundColor: value === n ? colors.primary : colors.surface,
                borderColor: value === n ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onChange(n)}
          >
            <Text style={{ color: value === n ? '#fff' : colors.text, fontWeight: '600', fontSize: 12 }}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim, padding: 20 }}>
          <View style={styles.topHeader}>
            <View>
              <Text style={[styles.brand, { color: colors.accent }]}>{APP_CONFIG.name}</Text>
              <Text style={[styles.heading, { color: colors.text }]}>오늘의 꿈을 남겨보세요</Text>
            </View>
            {streak && (
              <View style={[styles.streakBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="flame" size={16} color={colors.warning} />
                <Text style={[styles.streakText, { color: colors.text }]}>{streak.currentStreak}일</Text>
              </View>
            )}
          </View>

          {isOffline && (
            <View style={[styles.offlineBanner, { backgroundColor: colors.warning }]}>
              <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
              <Text style={styles.offlineText}>오프라인 해석 모드</Text>
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: colors.text }]}>꿈 내용</Text>
          <TextInput
            style={[
              styles.dreamInput,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            placeholder="장면, 인물, 감정, 장소를 자유롭게 적어주세요..."
            placeholderTextColor={colors.textSecondary}
            value={dreamContent}
            onChangeText={setDreamContent}
            multiline
            textAlignVertical="top"
            maxLength={APP_CONFIG.maxDreamLength}
          />
          <Text style={[styles.counter, { color: colors.textSecondary }]}>
            {dreamContent.length}/{APP_CONFIG.maxDreamLength}
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>감정</Text>
          <View style={styles.emotionGrid}>
            {EMOTIONS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.emotionButton,
                  {
                    backgroundColor: emotion === item.key ? colors.primary : colors.surface,
                    borderColor: emotion === item.key ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setEmotion(item.key)}
              >
                <Text style={styles.emotionEmoji}>{item.emoji}</Text>
                <Text style={{ color: emotion === item.key ? '#fff' : colors.text, fontSize: 12, fontWeight: '600' }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.advancedToggle} onPress={() => setShowAdvanced(!showAdvanced)}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>
              {showAdvanced ? '상세 옵션 숨기기' : '상세 옵션 (유형·생생함·태그)'}
            </Text>
            <Ionicons name={showAdvanced ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} />
          </TouchableOpacity>

          {showAdvanced && (
            <View style={[styles.advancedBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 0 }]}>꿈 유형</Text>
              <View style={styles.typeRow}>
                {DREAM_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.typeChip,
                      {
                        backgroundColor: dreamType === type.key ? colors.primary : colors.background,
                        borderColor: dreamType === type.key ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setDreamType(type.key)}
                  >
                    <Text style={{ color: dreamType === type.key ? '#fff' : colors.text, fontSize: 12, fontWeight: '600' }}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <ScorePicker label="생생함" value={vividness} onChange={setVividness} />
              <ScorePicker label="수면 품질" value={sleepQuality} onChange={setSleepQuality} />

              <Text style={[styles.sectionTitle, { color: colors.text }]}>태그</Text>
              <TextInput
                style={[
                  styles.tagInput,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                placeholder="예: 학교, 가족, 반복꿈"
                placeholderTextColor={colors.textSecondary}
                value={tagsInput}
                onChangeText={setTagsInput}
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.analyzeButton, { backgroundColor: colors.primary }, isAnalyzing && styles.disabled]}
            onPress={handleAnalyzeDream}
            disabled={isAnalyzing}
            activeOpacity={0.8}
          >
            <Ionicons name={isAnalyzing ? 'hourglass-outline' : 'sparkles'} size={20} color="#fff" />
            <Text style={styles.analyzeButtonText}>{isAnalyzing ? '해석 중...' : '꿈 해석하기'}</Text>
          </TouchableOpacity>

          {isAnalyzing && (
            <View style={[styles.loadingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View style={[styles.progressFill, { width: `${loadingProgress}%`, backgroundColor: colors.accent }]} />
              </View>
              <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 10 }}>
                {Math.round(loadingProgress)}% · 장면을 분석하고 있습니다
              </Text>
            </View>
          )}

          {analysisResult && (
            <View style={styles.resultSection}>
              <View style={styles.resultHeader}>
                <Ionicons name="sparkles" size={18} color={colors.accent} />
                <Text style={[styles.resultTitle, { color: colors.text }]}>
                  해석 결과 · {analysisResult.source === 'ai' ? 'AI' : '오프라인'}
                </Text>
              </View>

              <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.summary, { color: colors.accent }]}>{analysisResult.summary}</Text>

                <View style={styles.confidenceRow}>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>신뢰도</Text>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>
                    {Math.round(analysisResult.confidence * 100)}%
                  </Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: colors.border, marginBottom: 14 }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${analysisResult.confidence * 100}%`,
                        backgroundColor: colors.success,
                      },
                    ]}
                  />
                </View>

                <Text style={[styles.blockTitle, { color: colors.text }]}>해석</Text>
                <Text style={[styles.bodyText, { color: colors.text }]}>{analysisResult.interpretation}</Text>

                {analysisResult.matchedSymbols.length > 0 && (
                  <>
                    <Text style={[styles.blockTitle, { color: colors.text }]}>감지된 상징</Text>
                    <View style={styles.symbolRow}>
                      {analysisResult.matchedSymbols.map((s) => (
                        <View key={s} style={[styles.symbolChip, { borderColor: colors.accent }]}>
                          <Text style={{ color: colors.text, fontSize: 12 }}>{s}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                <Text style={[styles.blockTitle, { color: colors.text }]}>추천</Text>
                {analysisResult.recommendations.map((r) => (
                  <View key={r} style={styles.recoRow}>
                    <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.bodyText, { color: colors.textSecondary, flex: 1 }]}>{r}</Text>
                  </View>
                ))}

                <Text style={[styles.feedbackTitle, { color: colors.text }]}>도움이 되었나요?</Text>
                <View style={styles.feedbackButtons}>
                  <TouchableOpacity
                    style={[styles.feedbackButton, { backgroundColor: colors.success }]}
                    onPress={() => handleFeedback(true)}
                  >
                    <Ionicons name="thumbs-up" size={16} color="#fff" />
                    <Text style={styles.feedbackButtonText}>도움됨</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.feedbackButton, { backgroundColor: colors.error }]}
                    onPress={() => handleFeedback(false)}
                  >
                    <Ionicons name="thumbs-down" size={16} color="#fff" />
                    <Text style={styles.feedbackButtonText}>별로예요</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          <AdMobBanner adSize="BANNER" style={{ marginTop: 16 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 28 },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  brand: { fontSize: 13, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  heading: { fontSize: 22, fontWeight: '700' },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  streakText: { fontWeight: '700', fontSize: 13, marginLeft: 4 },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 14,
  },
  offlineText: { color: '#fff', fontSize: 12, fontWeight: '600', marginLeft: 6 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10, marginTop: 8 },
  dreamInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    minHeight: 120,
    fontSize: 16,
    lineHeight: 24,
  },
  counter: { textAlign: 'right', fontSize: 11, marginTop: 6, marginBottom: 8 },
  emotionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  emotionButton: {
    width: '31%',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
  },
  emotionEmoji: { fontSize: 22, marginBottom: 4 },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 8,
  },
  advancedBox: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 8 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  typeChip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  scoreBlock: { marginBottom: 10 },
  scoreLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  scoreRow: { flexDirection: 'row', gap: 8 },
  scoreChip: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagInput: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14 },
  analyzeButton: {
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  disabled: { opacity: 0.6 },
  analyzeButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  loadingCard: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  resultSection: { marginTop: 8 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  resultTitle: { fontSize: 16, fontWeight: '700', marginLeft: 8 },
  resultCard: { borderWidth: 1, borderRadius: 14, padding: 16 },
  summary: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  confidenceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  blockTitle: { fontSize: 14, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  bodyText: { fontSize: 14, lineHeight: 22 },
  symbolRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  symbolChip: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  recoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  bullet: { width: 5, height: 5, borderRadius: 3, marginTop: 8, marginRight: 10 },
  feedbackTitle: { textAlign: 'center', fontWeight: '600', marginTop: 18, marginBottom: 10 },
  feedbackButtons: { flexDirection: 'row', justifyContent: 'space-around' },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 110,
    justifyContent: 'center',
  },
  feedbackButtonText: { color: '#fff', fontWeight: '600', marginLeft: 6 },
});
