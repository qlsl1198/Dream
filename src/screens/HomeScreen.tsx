import React, { useState, useEffect } from 'react';
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
import OpenAI from 'openai';
import { useTheme } from '../contexts/ThemeContext';
import { DreamStorage, DreamRecord } from '../services/DreamStorage';
import { FeedbackService } from '../services/FeedbackService';
import { NetworkService } from '../services/NetworkService';
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

// AI 기반 꿈 해석 엔진
class AIDreamInterpreter {
  private openai: OpenAI;

      constructor() {
      // 환경 변수 디버깅
      console.log('EXPO_PUBLIC_OPENAI_API_KEY from env:', process.env.EXPO_PUBLIC_OPENAI_API_KEY);
      console.log('All env vars:', process.env);
      
      this.openai = new OpenAI({
        apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true // React Native 환경에서 필요
      });
  }

  async analyzeDream(content: string, emotion: string = ''): Promise<any> {
    try {
      const prompt = this.createPrompt(content, emotion);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "당신은 전문적인 꿈 해석가입니다. 꿈의 내용을 분석하여 심리적 의미와 해석을 제공하고, 실용적인 조언을 드립니다. 한국어로 답변해주세요."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || '';
      return this.parseResponse(response);
      
    } catch (error) {
      console.error('OpenAI API 오류:', error);
      // API 오류 시 폴백 로직
      return this.getFallbackResponse(content, emotion);
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

  private getFallbackResponse(content: string, emotion: string): any {
    return {
      themes: ['general'],
      interpretation: '죄송합니다. 현재 AI 서비스에 일시적인 문제가 있습니다. 꿈은 우리의 무의식이 전달하는 중요한 메시지입니다. 꿈의 내용을 자세히 기록하고, 현재 상황과 연결지어 생각해보시기 바랍니다.',
      confidence: 0.3,
      recommendations: [
        '꿈의 내용을 일기에 기록해보세요',
        '현재 상황을 객관적으로 바라보세요',
        '신뢰할 수 있는 사람과 대화해보세요'
      ]
    };
  }
}

const dreamInterpreter = new AIDreamInterpreter();

export default function HomeScreen() {
  const { colors } = useTheme();
  const [dreamContent, setDreamContent] = useState('');
  const [emotion, setEmotion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentDreamId, setCurrentDreamId] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  const emotions = [
    { key: 'joy', label: '기쁨', emoji: '😊' },
    { key: 'sadness', label: '슬픔', emoji: '😢' },
    { key: 'fear', label: '두려움', emoji: '😨' },
    { key: 'anger', label: '분노', emoji: '😠' },
    { key: 'surprise', label: '놀람', emoji: '😲' },
    { key: 'neutral', label: '평온', emoji: '😌' },
  ];

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

    // 네트워크 상태 확인
    checkNetworkStatus();
  }, []);

  const checkNetworkStatus = async () => {
    try {
      const networkService = NetworkService.getInstance();
      const isConnected = await networkService.checkInternetConnectivity();
      setIsOffline(!isConnected);
    } catch (error) {
      console.error('네트워크 상태 확인 오류:', error);
      setIsOffline(true);
    }
  };

  const analyzeDreamOffline = async () => {
    setIsAnalyzing(true);
    setLoadingProgress(0);
    
    // 오프라인 로딩 시뮬레이션
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
      // 기본 해석 엔진 사용
      const result = await dreamInterpreter.analyzeDream(dreamContent, emotion);
      clearInterval(progressInterval);
      setAnalysisResult(result);
      
      // 꿈 기록 저장
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
        '꿈 해석 완료 (오프라인)',
        '기본 해석이 완료되어 기록에 저장되었습니다.',
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
      console.error('오프라인 꿈 해석 오류:', error);
      clearInterval(progressInterval);
      setLoadingProgress(0);
      Alert.alert('오류', '꿈 해석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeDream = async () => {
    if (!dreamContent.trim()) {
      Alert.alert('알림', '꿈 내용을 입력해주세요.');
      return;
    }

    // 네트워크 상태 재확인
    await checkNetworkStatus();
    
    if (isOffline) {
      Alert.alert(
        '오프라인 상태',
        '인터넷 연결을 확인해주세요. 오프라인에서는 기본 해석만 제공됩니다.',
        [
          { text: '취소', style: 'cancel' },
          { text: '계속하기', onPress: () => analyzeDreamOffline() }
        ]
      );
      return;
    }

    setIsAnalyzing(true);
    setLoadingProgress(0);
    
    // 로딩 진행률 시뮬레이션
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    
    try {
      const result = await dreamInterpreter.analyzeDream(dreamContent, emotion);
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setAnalysisResult(result);
      
      // 꿈 기록 저장
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
        '꿈 해석 완료',
        '꿈이 해석되어 기록에 저장되었습니다.',
        [
          {
            text: '확인',
            onPress: () => {
      setDreamContent('');
      setEmotion('');
              // 해석 결과는 유지하여 사용자가 계속 볼 수 있도록 합니다.
            },
          },
        ]
      );
      
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
      await FeedbackService.saveFeedback({
        dreamId: currentDreamId,
        isAccurate: isHelpful,
        helpfulness: isHelpful ? 5 : 1,
        timestamp: new Date().toISOString(),
      });
      
      Alert.alert(
        '피드백 감사합니다',
        isHelpful ? '도움이 되었다니 기쁩니다!' : '더 나은 해석을 위해 노력하겠습니다.',
        [{ text: '확인' }]
      );
    } catch (error) {
      console.error('피드백 저장 오류:', error);
    }
  };

  const renderEmotionSelector = () => (
    <View style={styles.emotionSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>꿈의 감정</Text>
      <View style={styles.emotionGrid}>
        {emotions.map((emotionItem) => (
          <TouchableOpacity
            key={emotionItem.key}
            style={[
              styles.emotionButton,
              { 
                backgroundColor: colors.surface,
                borderColor: colors.border 
              },
              emotion === emotionItem.key && {
                backgroundColor: colors.primary,
                borderColor: colors.primary
              }
            ]}
            onPress={() => setEmotion(emotionItem.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.emotionEmoji}>{emotionItem.emoji}</Text>
            <Text style={[
              styles.emotionLabel,
              { color: colors.text },
              emotion === emotionItem.key && { color: '#fff' }
            ]}>
              {emotionItem.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderLoadingState = () => {
    if (!isAnalyzing) return null;

    return (
      <View style={styles.loadingSection}>
        <View style={styles.loadingHeader}>
          <Ionicons name="hourglass-outline" size={20} color={colors.primary} />
          <Text style={[styles.loadingTitle, { color: colors.text }]}>꿈을 분석하고 있어요...</Text>
        </View>
        
        <View style={[styles.loadingCard, { 
          backgroundColor: colors.surface,
          borderColor: colors.border 
        }]}>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <Animated.View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${loadingProgress}%`,
                    backgroundColor: colors.primary 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: colors.text }]}>
              {Math.round(loadingProgress)}%
            </Text>
          </View>
          
          <Text style={[styles.loadingDescription, { color: colors.textSecondary }]}>
            AI가 꿈의 내용을 분석하고 있습니다.{'\n'}잠시만 기다려주세요.
          </Text>
        </View>
      </View>
    );
  };

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    return (
      <View style={styles.resultSection}>
        <View style={styles.resultHeader}>
          <Ionicons name="sparkles" size={20} color={colors.primary} />
          <Text style={[styles.resultTitle, { color: colors.text }]}>꿈 해석 결과</Text>
        </View>
        
        <View style={[styles.resultCard, { 
          backgroundColor: colors.surface,
          borderColor: colors.border 
        }]}>
          <View style={styles.confidenceContainer}>
            <Text style={[styles.confidenceLabel, { color: colors.text }]}>해석 신뢰도</Text>
            <View style={styles.confidenceBarContainer}>
              <View style={styles.confidenceBar}>
                <View 
                  style={[
                    styles.confidenceFill, 
                    { width: `${analysisResult.confidence * 100}%` }
                  ]} 
                />
              </View>
              <Text style={[styles.confidenceText, { color: colors.text }]}>
                {Math.round(analysisResult.confidence * 100)}%
              </Text>
            </View>
          </View>

          <View style={styles.interpretationContainer}>
            <Text style={[styles.interpretationTitle, { color: colors.text }]}>해석</Text>
            <Text style={[styles.interpretationText, { color: colors.text }]}>
              {analysisResult.interpretation}
            </Text>
          </View>

          <View style={styles.recommendationsContainer}>
            <Text style={[styles.recommendationsTitle, { color: colors.text }]}>추천 활동</Text>
            {analysisResult.recommendations.map((recommendation: string, index: number) => (
              <View key={index} style={styles.recommendationItem}>
                <View style={[styles.recommendationBullet, { backgroundColor: colors.primary }]} />
                <Text style={[styles.recommendationText, { color: colors.text }]}>{recommendation}</Text>
              </View>
            ))}
          </View>
          
          {/* 피드백 섹션 */}
          <View style={styles.feedbackContainer}>
            <Text style={[styles.feedbackTitle, { color: colors.text }]}>해석이 도움이 되었나요?</Text>
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
                <Text style={styles.feedbackButtonText}>도움안됨</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <View style={styles.inputSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>꿈 내용</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.dreamInput, { 
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.text 
                }]}
                placeholder="꿈에서 기억나는 내용을 자유롭게 적어주세요..."
                placeholderTextColor={colors.textSecondary}
                value={dreamContent}
                onChangeText={setDreamContent}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                accessibilityLabel="꿈 내용 입력"
                accessibilityHint="꿈에서 기억나는 내용을 자유롭게 적어주세요"
                accessibilityRole="text"
              />
            </View>
          </View>

          {renderEmotionSelector()}

          <TouchableOpacity
            style={[
              styles.analyzeButton, 
              { backgroundColor: colors.primary },
              isAnalyzing && styles.analyzeButtonDisabled
            ]}
            onPress={handleAnalyzeDream}
            disabled={isAnalyzing}
            activeOpacity={0.7}
            accessibilityLabel={isAnalyzing ? '꿈 해석 중' : '꿈 해석하기'}
            accessibilityHint="꿈 내용을 분석하여 해석을 제공합니다"
            accessibilityRole="button"
          >
            <Ionicons 
              name={isAnalyzing ? "hourglass-outline" : "sparkles"} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.analyzeButtonText}>
              {isAnalyzing ? '해석 중...' : '꿈 해석하기'}
            </Text>
          </TouchableOpacity>

          {isOffline && (
            <View style={[styles.offlineBanner, { backgroundColor: colors.warning }]}>
              <Ionicons name="wifi-outline" size={16} color="#fff" />
              <Text style={styles.offlineText}>오프라인 상태 - 기본 해석만 제공됩니다</Text>
            </View>
          )}
          {renderLoadingState()}
          {renderAnalysisResult()}
          
          {/* AdMob 배너 광고 */}
          <AdMobBanner
            unitId={process.env.EXPO_PUBLIC_ADMOB_UNIT_ID}
            adSize="BANNER" // 표준 배너 크기 (320x50)
            onAdLoaded={() => console.log('AdMob 광고 로드 완료')}
            onAdFailedToLoad={(error) => console.log('AdMob 광고 로드 실패:', error)}
            onAdClicked={() => console.log('AdMob 광고 클릭')}
            style={{ marginTop: 20 }}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    padding: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputContainer: {
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dreamInput: {
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  emotionSection: {
    marginBottom: 24,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emotionButton: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emotionButtonSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  emotionEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  emotionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  emotionLabelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  analyzeButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowColor: '#9ca3af',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultSection: {
    marginTop: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  confidenceContainer: {
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  confidenceBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    minWidth: 35,
  },
  // 로딩 상태 스타일
  loadingSection: {
    marginTop: 20,
  },
  loadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
  },
  loadingDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  // 피드백 스타일
  feedbackContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 100,
    justifyContent: 'center',
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  // 오프라인 배너 스타일
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  offlineText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  interpretationContainer: {
    marginBottom: 16,
  },
  interpretationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  interpretationText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  recommendationsContainer: {
    marginTop: 4,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6366f1',
    marginTop: 8,
    marginRight: 12,
  },
  recommendationText: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
    lineHeight: 18,
  },
});
