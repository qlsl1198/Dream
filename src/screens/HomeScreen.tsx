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
import { LocalAIService } from '../services/LocalAIService';
import AdMobBanner, { ADMOB_AD_SIZES } from '../components/AdMobBanner';

// 간단한 꿈 해석 엔진
class SimpleDreamInterpreter {
  private dreamThemes: { [key: string]: string[] } = {
    falling: ['떨어지다', '추락', '높은 곳', '절벽', '계단', '엘리베이터'],
    chasing: ['쫓기다', '도망', '추격', '뒤쫓다', '숨다', '도주'],
    flying: ['날다', '비행', '하늘', '공중', '날개', '떠다니다'],
    water: ['물', '바다', '강', '호수', '비', '홍수', '수영'],
    teeth: ['이빨', '치아', '빠지다', '부러지다', '피', '아프다'],
    exam: ['시험', '시험장', '문제', '답안지', '교실', '선생님'],
  };

  private interpretations: { [key: string]: string } = {
    falling: '추락하는 꿈은 현재 불안감이나 통제력 상실감을 나타냅니다. 중요한 결정을 내려야 하는 상황이나 변화에 대한 두려움과 관련이 있을 수 있습니다.',
    chasing: '쫓기는 꿈은 현실에서 피하고 싶은 문제나 책임감을 나타냅니다. 해결해야 할 과제나 회피하고 싶은 상황이 있을 때 자주 나타납니다.',
    flying: '날아다니는 꿈은 자유로움과 해방감을 나타냅니다. 현실의 제약에서 벗어나고 싶은 욕망이나 새로운 가능성에 대한 기대를 의미할 수 있습니다.',
    water: '물이 나오는 꿈은 감정의 상태를 나타냅니다. 맑은 물은 평온함을, 거친 물은 감정의 혼란을 의미할 수 있습니다.',
    teeth: '이빨이 빠지는 꿈은 자신감의 상실이나 외모에 대한 걱정을 나타냅니다. 사회적 관계에서의 불안감이나 변화에 대한 두려움과 관련이 있습니다.',
    exam: '시험을 보는 꿈은 평가받는 상황이나 준비 부족에 대한 불안감을 나타냅니다. 중요한 일이나 도전 앞에서의 긴장감을 의미합니다.',
  };

  analyzeDream(content: string, emotion: string = '') {
    const themes = this.identifyThemes(content);
    const primaryTheme = themes[0] || 'general';
    
    let interpretation = this.interpretations[primaryTheme] || 
      '꿈의 내용을 분석한 결과, 현재 상황과 관련된 심리적 상태를 반영하고 있습니다.';

    if (emotion) {
      const emotionAnalysis = this.analyzeEmotion(emotion);
      interpretation += ` 현재 ${emotionAnalysis} 상태로 보입니다.`;
    }

    const confidence = this.calculateConfidence(content, themes);

    return {
      themes,
      interpretation,
      confidence,
      recommendations: this.getRecommendations(primaryTheme)
    };
  }

  private identifyThemes(content: string): string[] {
    const themes: string[] = [];
    const lowerContent = content.toLowerCase();

    for (const [theme, keywords] of Object.entries(this.dreamThemes)) {
      const matchCount = keywords.filter(keyword => 
        lowerContent.includes(keyword.toLowerCase())
      ).length;

      if (matchCount > 0) {
        themes.push(theme);
      }
    }

    return themes;
  }

  private analyzeEmotion(emotion: string): string {
    const emotionMap: { [key: string]: string } = {
      joy: '기쁘고 행복한',
      sadness: '슬프고 우울한',
      fear: '불안하고 두려운',
      anger: '화가 나고 짜증스러운',
      surprise: '놀라고 당황한',
      neutral: '평온한'
    };
    return emotionMap[emotion] || '복잡한 감정의';
  }

  private calculateConfidence(content: string, themes: string[]): number {
    if (themes.length === 0) return 0.3;
    return Math.min(themes.length * 0.2, 1.0);
  }

  private getRecommendations(theme: string): string[] {
    const recommendations: { [key: string]: string[] } = {
      falling: [
        '현재 상황을 차근차근 정리해보세요',
        '명상이나 산책을 통해 마음을 정리해보세요',
        '신뢰할 수 있는 사람과 대화해보세요'
      ],
      chasing: [
        '피하고 있는 문제를 직면해보세요',
        '문제를 작은 단위로 나누어 해결해보세요',
        '도움을 요청하는 것을 두려워하지 마세요'
      ],
      flying: [
        '새로운 도전을 시도해보세요',
        '창의적인 활동에 참여해보세요',
        '자유로운 시간을 가져보세요'
      ],
      water: [
        '감정을 표현하는 방법을 찾아보세요',
        '일기를 써보세요',
        '예술 활동을 해보세요'
      ],
      teeth: [
        '자신감을 기르는 활동을 해보세요',
        '외모 관리에 신경 써보세요',
        '긍정적인 자기 대화를 해보세요'
      ],
      exam: [
        '충분한 준비를 해보세요',
        '긍정적인 마인드를 유지하세요',
        '실패를 두려워하지 마세요'
      ]
    };
    return recommendations[theme] || [
      '현재 상황을 차근차근 정리해보세요',
      '긍정적인 마인드를 유지하세요',
      '신뢰할 수 있는 사람과 대화해보세요'
    ];
  }
}

// 로컬 AI 기반 꿈 해석 엔진 (Ollama / LM Studio)
class AIDreamInterpreter {
  private fallback = new SimpleDreamInterpreter();

  async analyzeDream(content: string, emotion: string = ''): Promise<any> {
    try {
      const prompt = this.createPrompt(content, emotion);
      const response = await LocalAIService.chatCompletion(
        [
          {
            role: 'system',
            content:
              '당신은 전문적인 꿈 해석가입니다. 꿈의 내용을 분석하여 심리적 의미와 해석을 제공하고, 실용적인 조언을 드립니다. 한국어로 답변해주세요.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        { maxTokens: 1000, temperature: 0.7 }
      );

      if (!response) {
        return this.fallback.analyzeDream(content, emotion);
      }

      return this.parseResponse(response);
    } catch (error) {
      console.error('로컬 AI 오류:', error);
      return this.fallback.analyzeDream(content, emotion);
    }
  }

  private createPrompt(content: string, emotion: string): string {
    let prompt = `다음 꿈에 대해 분석해주세요:\n\n꿈 내용: ${content}\n\n`;
    
    if (emotion) {
      const emotionMap: { [key: string]: string } = {
        joy: '기쁨',
        sadness: '슬픔',
        fear: '두려움',
        anger: '분노',
        surprise: '놀람',
        neutral: '평온함'
      };
      prompt += `꿈에서 느낀 감정: ${emotionMap[emotion] || emotion}\n\n`;
    }

    prompt += `다음 형식으로 답변해주세요:
1. 주요 테마: 꿈의 핵심 주제
2. 심리적 해석: 꿈이 나타내는 심리적 의미
3. 조언: 실생활에 적용할 수 있는 구체적인 조언 3가지
4. 신뢰도: 해석의 신뢰도 (0-100%)`;

    return prompt;
  }

  private parseResponse(response: string): any {
    const lines = response.split('\n').filter(line => line.trim());
    
    let themes: string[] = [];
    let interpretation = '';
    let recommendations: string[] = [];
    let confidence = 0.8; // 기본 신뢰도

    for (const line of lines) {
      if (line.includes('주요 테마:') || line.includes('테마:')) {
        const themeText = line.split(':')[1]?.trim() || '';
        themes = themeText.split(',').map(t => t.trim()).filter(t => t);
      } else if (line.includes('심리적 해석:') || line.includes('해석:')) {
        interpretation = line.split(':')[1]?.trim() || '';
      } else if (line.includes('조언:') || line.includes('추천:')) {
        const adviceText = line.split(':')[1]?.trim() || '';
        recommendations = adviceText.split(',').map(r => r.trim()).filter(r => r);
      } else if (line.includes('신뢰도:')) {
        const confidenceText = line.split(':')[1]?.trim() || '';
        const match = confidenceText.match(/(\d+)%/);
        if (match) {
          confidence = parseInt(match[1]) / 100;
        }
      }
    }

    // 파싱이 제대로 안된 경우 전체 응답을 해석으로 사용
    if (!interpretation) {
      interpretation = response;
    }

    // 추천사항이 없는 경우 기본 추천사항 제공
    if (recommendations.length === 0) {
      recommendations = [
        '꿈의 내용을 일기에 기록해보세요',
        '현재 상황을 객관적으로 바라보세요',
        '신뢰할 수 있는 사람과 대화해보세요'
      ];
    }

    return {
      themes: themes.length > 0 ? themes : ['general'],
      interpretation,
      confidence,
      recommendations
    };
  }

}

const dreamInterpreter = new AIDreamInterpreter();

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
  const [isLocalAIOffline, setIsLocalAIOffline] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // 로컬 AI 서버 상태 확인
    checkLocalAIStatus();
  }, []);

  const checkLocalAIStatus = async () => {
    try {
      const available = await LocalAIService.isAvailable();
      setIsLocalAIOffline(!available);
    } catch (error) {
      console.error('로컬 AI 상태 확인 오류:', error);
      setIsLocalAIOffline(true);
    }
  };

  const analyzeDreamWithRuleEngine = async () => {
    setIsAnalyzing(true);
    setLoadingProgress(0);

    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 20;
      });
    }, 300);

    try {
      const result = new SimpleDreamInterpreter().analyzeDream(dreamContent, emotion);
      clearInterval(progressInterval);
      setAnalysisResult(result);

      const dreamId = Date.now().toString();
      const dreamRecord: DreamRecord = {
        id: dreamId,
        content: dreamContent,
        emotion: emotion,
        interpretation: result.interpretation,
        date: new Date().toISOString().split('T')[0],
        confidence: result.confidence,
        recommendations: result.recommendations,
      };

      await DreamStorage.saveDream(dreamRecord);
      setCurrentDreamId(dreamId);

      Alert.alert(
        '꿈 해석 완료 (기본 엔진)',
        '로컬 AI에 연결할 수 없어 기본 해석으로 저장되었습니다.',
        [
          {
            text: '확인',
            onPress: () => {
              setDreamContent('');
              setEmotion('');
            },
          },
        ]
      );
    } catch (error) {
      console.error('기본 엔진 꿈 해석 오류:', error);
      clearInterval(progressInterval);
      setLoadingProgress(0);
      Alert.alert('오류', '꿈 해석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeDream = async () => {
    if (dreamContent.trim().length < APP_CONFIG.minDreamLength) {
      Alert.alert('알림', `꿈 내용을 ${APP_CONFIG.minDreamLength}자 이상 입력해주세요.`);
      return;
    }

    await checkLocalAIStatus();

    if (isLocalAIOffline) {
      Alert.alert(
        '로컬 AI 연결 불가',
        'Ollama/LM Studio가 실행 중인지 확인해주세요. 기본 해석 엔진으로 계속할 수 있습니다.',
        [
          { text: '취소', style: 'cancel' },
          { text: '기본 해석 사용', onPress: () => analyzeDreamWithRuleEngine() },
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

          {isLocalAIOffline && (
            <View style={[styles.offlineBanner, { backgroundColor: colors.warning }]}>
              <Ionicons name="wifi-outline" size={16} color="#fff" />
              <Text style={styles.offlineText}>로컬 AI 연결 없음 - 기본 해석만 제공됩니다</Text>
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
