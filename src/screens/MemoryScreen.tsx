import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OpenAI from 'openai';
import { useTheme } from '../contexts/ThemeContext';

interface MemoryRecord {
  id: string;
  description: string;
  clues: string[];
  status: 'in_progress' | 'completed' | 'failed';
  date: string;
  aiAnalysis?: string;
  recoveredMemory?: string;
}

// AI 기반 기억 복원 엔진
class AIMemoryRecovery {
  private openai: OpenAI;

  constructor() {
    // 환경 변수 디버깅
    console.log('MemoryScreen - EXPO_PUBLIC_OPENAI_API_KEY from env:', process.env.EXPO_PUBLIC_OPENAI_API_KEY);
    console.log('MemoryScreen - All env vars:', process.env);
    
    this.openai = new OpenAI({
      apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  async generateQuestions(description: string): Promise<string[]> {
    try {
      const prompt = `다음 상황에 대해 기억을 복원하기 위한 구체적이고 도움이 되는 질문 5개를 생성해주세요:

상황: ${description}

다음과 같은 요소들을 고려한 질문을 만들어주세요:
- 감각적 기억 (시각, 청각, 촉각, 후각, 미각)
- 시간적 맥락 (언제, 계절, 시간대)
- 공간적 맥락 (어디서, 어떤 환경)
- 감정적 상태 (기분, 감정)
- 사회적 맥락 (누구와, 어떤 관계)

각 질문을 한 줄씩 작성해주세요.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "당신은 기억 복원 전문가입니다. 사람들이 잊어버린 기억을 되찾을 수 있도록 도와주는 구체적이고 유용한 질문을 만듭니다."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || '';
      return response.split('\n').filter(line => line.trim()).slice(0, 5);
      
    } catch (error) {
      console.error('AI 질문 생성 오류:', error);
      // 폴백 질문들
      return [
        '그때 누구와 함께 있었나요?',
        '어떤 계절이었나요?',
        '어디서 일어난 일인가요?',
        '그때 어떤 소리가 들렸나요?',
        '그때 어떤 기분이었나요?'
      ];
    }
  }

  async analyzeMemory(description: string, clues: string[]): Promise<{ analysis: string; recoveredMemory: string }> {
    try {
      const prompt = `다음 정보를 바탕으로 기억을 복원하고 분석해주세요:

원래 상황: ${description}

수집된 단서들:
${clues.map((clue, index) => `${index + 1}. ${clue}`).join('\n')}

다음 형식으로 답변해주세요:
1. 기억 분석: 수집된 단서들을 바탕으로 이 기억이 어떤 의미인지 분석
2. 복원된 기억: 단서들을 연결하여 더 완전한 기억으로 재구성

한국어로 답변해주세요.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "당신은 기억 복원 전문가입니다. 단편적인 기억들을 연결하여 완전한 기억으로 재구성하고, 그 의미를 분석합니다."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || '';
      return this.parseMemoryResponse(response);
      
    } catch (error) {
      console.error('AI 기억 분석 오류:', error);
      return {
        analysis: 'AI 분석 중 오류가 발생했습니다. 수집된 단서들을 바탕으로 스스로 기억을 연결해보세요.',
        recoveredMemory: '기억 복원을 위해 더 많은 단서가 필요할 수 있습니다.'
      };
    }
  }

  private parseMemoryResponse(response: string): { analysis: string; recoveredMemory: string } {
    const lines = response.split('\n').filter(line => line.trim());
    
    let analysis = '';
    let recoveredMemory = '';

    for (const line of lines) {
      if (line.includes('기억 분석:') || line.includes('분석:')) {
        analysis = line.split(':')[1]?.trim() || '';
      } else if (line.includes('복원된 기억:') || line.includes('복원:')) {
        recoveredMemory = line.split(':')[1]?.trim() || '';
      }
    }

    // 파싱이 제대로 안된 경우
    if (!analysis && !recoveredMemory) {
      const parts = response.split('\n\n');
      analysis = parts[0] || response;
      recoveredMemory = parts[1] || '기억 복원이 완료되었습니다.';
    }

    return { analysis, recoveredMemory };
  }
}

const memoryRecovery = new AIMemoryRecovery();

export default function MemoryScreen() {
  const { colors } = useTheme();
  const [description, setDescription] = useState('');
  const [currentQuestions, setCurrentQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [isRecovering, setIsRecovering] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  const questions = [
    '그때 누구와 함께 있었나요?',
    '어떤 계절이었나요?',
    '어디서 일어난 일인가요?',
    '그때 어떤 소리가 들렸나요?',
    '어떤 냄새가 났나요?',
    '그때 어떤 기분이었나요?',
    '그 전후로 어떤 일이 있었나요?',
    '그때 입고 있던 옷이 기억나나요?',
    '그때 먹었던 음식이 있나요?',
    '그때 들었던 음악이나 노래가 있나요?'
  ];

  const handleStartRecovery = async () => {
    if (!description.trim()) {
      Alert.alert('알림', '기억하고 싶은 상황을 설명해주세요.');
      return;
    }

    setIsGeneratingQuestions(true);
    
    try {
      // AI가 상황에 맞는 질문들을 생성
      const aiQuestions = await memoryRecovery.generateQuestions(description);
      setCurrentQuestions(aiQuestions);
      setCurrentQuestionIndex(0);
      setAnswers([]);
    setIsRecovering(true);
    } catch (error) {
      console.error('질문 생성 오류:', error);
      // 폴백으로 기본 질문들 사용
      const selectedQuestions = questions.slice(0, 5);
    setCurrentQuestions(selectedQuestions);
    setCurrentQuestionIndex(0);
    setAnswers([]);
      setIsRecovering(true);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleAnswerQuestion = () => {
    if (!currentAnswer.trim()) {
      Alert.alert('알림', '답변을 입력해주세요.');
      return;
    }

    const newAnswers = [...answers, currentAnswer.trim()];
    setAnswers(newAnswers);
    setCurrentAnswer(''); // 답변 입력창 초기화

    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeMemoryRecovery(newAnswers);
    }
  };

  const completeMemoryRecovery = async (finalAnswers: string[]) => {
    try {
      // AI가 수집된 단서들을 분석하여 기억을 복원
      const aiResult = await memoryRecovery.analyzeMemory(description, finalAnswers);
      
      const newMemory: MemoryRecord = {
        id: Date.now().toString(),
        description: description,
        clues: finalAnswers,
        status: 'completed',
        date: new Date().toISOString().split('T')[0],
        aiAnalysis: aiResult.analysis,
        recoveredMemory: aiResult.recoveredMemory
      };

      setMemories([newMemory, ...memories]);

      Alert.alert(
        '기억 복원 완료',
        'AI가 수집된 단서들을 분석하여 기억을 복원했습니다. 기록에 저장되었습니다.',
        [
          {
            text: '확인',
            onPress: () => {
              setDescription('');
              setCurrentQuestions([]);
              setCurrentQuestionIndex(0);
              setAnswers([]);
              setCurrentAnswer('');
              setIsRecovering(false);
            },
          },
        ]
      );
    } catch (error) {
      console.error('기억 복원 저장 오류:', error);
      Alert.alert('오류', '기억 복원 저장 중 오류가 발생했습니다.');
      setIsRecovering(false);
    }
  };

  const handleDeleteMemory = (id: string) => {
    Alert.alert(
      '기억 복원 기록 삭제',
      '이 기억 복원 기록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setMemories(memories.filter(memory => memory.id !== id));
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '완료';
      case 'in_progress': return '진행중';
      case 'failed': return '실패';
      default: return '알 수 없음';
    }
  };

  const renderMemoryItem = ({ item }: { item: MemoryRecord }) => (
    <View style={styles.memoryItem}>
      <View style={styles.memoryHeader}>
        <View style={styles.memoryInfo}>
          <Text style={styles.memoryDate}>{formatDate(item.date)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteMemory(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.memoryDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      {item.clues.length > 0 && (
        <View style={styles.cluesContainer}>
          <Text style={styles.cluesTitle}>수집된 단서:</Text>
          {item.clues.slice(0, 3).map((clue, index) => (
            <Text key={index} style={styles.clueText} numberOfLines={1}>
              • {clue || '답변 없음'}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  const renderRecoveryProcess = () => {
    if (!isRecovering || currentQuestions.length === 0) return null;

    return (
      <View style={[styles.recoveryContainer, { 
        backgroundColor: colors.surface,
        borderColor: colors.border 
      }]}>
        <Text style={[styles.recoveryTitle, { color: colors.text }]}>기억 복원 중...</Text>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {currentQuestionIndex + 1} / {currentQuestions.length}
        </Text>
        
        <View style={[styles.questionContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.questionText, { color: colors.text }]}>
            {currentQuestions[currentQuestionIndex]}
          </Text>
        </View>

        <View style={styles.answerContainer}>
          <TextInput
            style={[styles.answerInput, { 
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
              color: colors.text 
            }]}
            placeholder="답변을 입력하세요..."
            placeholderTextColor={colors.textSecondary}
            value={currentAnswer}
            onChangeText={setCurrentAnswer}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.success }]}
            onPress={handleAnswerQuestion}
          >
            <Text style={styles.submitButtonText}>답변 완료</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>기억 복원</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            깜빡한 기억을 단계별로 복원해보세요
          </Text>
        </View>

        <View style={styles.content}>
          {!isRecovering ? (
            <View style={styles.inputContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>기억하고 싶은 상황</Text>
              <TextInput
                style={[styles.descriptionInput, { 
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.text 
                }]}
                placeholder="기억하고 싶은 상황을 자세히 설명해주세요..."
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              
              <TouchableOpacity
                style={[
                  styles.startButton, 
                  { backgroundColor: colors.primary },
                  isGeneratingQuestions && styles.disabledButton
                ]}
                onPress={handleStartRecovery}
                disabled={isGeneratingQuestions}
              >
                <Ionicons name="search" size={20} color="#fff" />
                <Text style={styles.startButtonText}>
                  {isGeneratingQuestions ? 'AI가 질문을 생성 중...' : '기억 복원 시작'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            renderRecoveryProcess()
          )}

          <View style={styles.historyContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>기억 복원 기록</Text>
            
            {memories.length > 0 ? (
              memories.map((memory) => (
                <View key={memory.id} style={[styles.memoryItem, { 
                  backgroundColor: colors.surface,
                  borderColor: colors.border 
                }]}>
                  <View style={styles.memoryHeader}>
                    <View style={styles.memoryInfo}>
                      <Text style={[styles.memoryDate, { color: colors.text }]}>{formatDate(memory.date)}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(memory.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(memory.status)}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteMemory(memory.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={[styles.memoryDescription, { color: colors.text }]} numberOfLines={2}>
                    {memory.description}
                  </Text>
                  
                  {memory.clues.length > 0 && (
                    <View style={styles.cluesContainer}>
                      <Text style={[styles.cluesTitle, { color: colors.textSecondary }]}>수집된 단서:</Text>
                      {memory.clues.slice(0, 3).map((clue, index) => (
                        <Text key={index} style={[styles.clueText, { color: colors.textSecondary }]} numberOfLines={1}>
                          • {clue || '답변 없음'}
                        </Text>
                      ))}
                    </View>
                  )}
                  
                  {memory.aiAnalysis && (
                    <View style={[styles.aiAnalysisContainer, { 
                      backgroundColor: colors.primary + '20',
                      borderLeftColor: colors.primary 
                    }]}>
                      <Text style={[styles.aiAnalysisTitle, { color: colors.primary }]}>🤖 AI 분석:</Text>
                      <Text style={[styles.aiAnalysisText, { color: colors.primary }]} numberOfLines={3}>
                        {memory.aiAnalysis}
                      </Text>
                    </View>
                  )}
                  
                  {memory.recoveredMemory && (
                    <View style={[styles.recoveredMemoryContainer, { 
                      backgroundColor: colors.success + '20',
                      borderLeftColor: colors.success 
                    }]}>
                      <Text style={[styles.recoveredMemoryTitle, { color: colors.success }]}>💭 복원된 기억:</Text>
                      <Text style={[styles.recoveredMemoryText, { color: colors.success }]} numberOfLines={3}>
                        {memory.recoveredMemory}
                      </Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>아직 기억 복원 기록이 없습니다</Text>
              </View>
            )}
          </View>
        </View>
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
  content: {
    padding: 20,
    paddingTop: 10,
  },
  inputContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  descriptionInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 100,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  recoveryContainer: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
  },
  recoveryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 20,
  },
  questionContainer: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  answerContainer: {
    marginTop: 16,
  },
  answerInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    minHeight: 80,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  submitButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  historyContainer: {
    marginTop: 20,
  },
  memoryItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  memoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  memoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memoryDate: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 4,
  },
  memoryDescription: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  cluesContainer: {
    marginTop: 8,
  },
  cluesTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  clueText: {
    fontSize: 12,
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  aiAnalysisContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  aiAnalysisTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  aiAnalysisText: {
    fontSize: 12,
    lineHeight: 16,
  },
  recoveredMemoryContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  recoveredMemoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  recoveredMemoryText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
