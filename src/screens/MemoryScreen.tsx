import React, { useEffect, useState } from 'react';
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
import { useTheme } from '../contexts/ThemeContext';
import { LocalAIService } from '../services/LocalAIService';

const FALLBACK_QUESTIONS = [
  '그때 누구와 함께 있었나요?',
  '어떤 계절이었나요?',
  '어디서 일어난 일인가요?',
  '그때 어떤 소리가 들렸나요?',
  '그때 어떤 기분이었나요?',
];

// 로컬 AI 기반 기억 복원 엔진 (Ollama / LM Studio)
class AIMemoryRecovery {
  async generateQuestions(description: string): Promise<string[]> {
    if (!this.openai) return FALLBACK_QUESTIONS;

      const response = await LocalAIService.chatCompletion(
        [
          {
            role: 'system',
            content:
              '당신은 기억 복원 전문가입니다. 사람들이 잊어버린 기억을 되찾을 수 있도록 도와주는 구체적이고 유용한 질문을 만듭니다.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        { maxTokens: 500, temperature: 0.7 }
      );

      if (!response) {
        return this.getFallbackQuestions();
      }

      return response.split('\n').filter(line => line.trim()).slice(0, 5);
    } catch (error) {
      console.error('로컬 AI 질문 생성 오류:', error);
      return this.getFallbackQuestions();
    }
  }

  async analyzeMemory(
    description: string,
    clues: string[]
  ): Promise<{ analysis: string; recoveredMemory: string }> {
    try {
      const prompt = `다음 정보를 바탕으로 기억을 복원하고 분석해주세요:

원래 상황: ${description}

수집된 단서들:
${clues.map((clue, index) => `${index + 1}. ${clue}`).join('\n')}

다음 형식으로 답변해주세요:
1. 기억 분석: 수집된 단서들을 바탕으로 이 기억이 어떤 의미인지 분석
2. 복원된 기억: 단서들을 연결하여 더 완전한 기억으로 재구성

한국어로 답변해주세요.`;

      const response = await LocalAIService.chatCompletion(
        [
          {
            role: 'system',
            content:
              '당신은 기억 복원 전문가입니다. 단편적인 기억들을 연결하여 완전한 기억으로 재구성하고, 그 의미를 분석합니다.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        { maxTokens: 800, temperature: 0.7 }
      );

      if (!response) {
        return this.getFallbackAnalysis();
      }

      return this.parseMemoryResponse(response);
    } catch (error) {
      console.error('로컬 AI 기억 분석 오류:', error);
      return this.getFallbackAnalysis();
    }
  }

  private getFallbackQuestions(): string[] {
    return [
      '그때 누구와 함께 있었나요?',
      '어떤 계절이었나요?',
      '어디서 일어난 일인가요?',
      '그때 어떤 소리가 들렸나요?',
      '그때 어떤 기분이었나요?',
    ];
  }

  private getFallbackAnalysis(): { analysis: string; recoveredMemory: string } {
    return {
      analysis:
        '로컬 AI 분석 중 오류가 발생했습니다. 수집된 단서들을 바탕으로 스스로 기억을 연결해보세요.',
      recoveredMemory: '기억 복원을 위해 더 많은 단서가 필요할 수 있습니다.',
    };
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

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    setMemories(await MemoryStorage.getMemories());
  };

  const handleStartRecovery = async () => {
    if (!description.trim()) {
      Alert.alert('알림', '기억하고 싶은 상황을 설명해주세요.');
      return;
    }

    setIsGeneratingQuestions(true);
    try {
      const aiQuestions = await memoryRecovery.generateQuestions(description);
      setCurrentQuestions(aiQuestions);
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
    setCurrentAnswer('');

    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeMemoryRecovery(newAnswers);
    }
  };

  const completeMemoryRecovery = async (finalAnswers: string[]) => {
    try {
      const aiResult = await memoryRecovery.analyzeMemory(description, finalAnswers);
      const newMemory: MemoryRecord = {
        id: Date.now().toString(),
        description,
        clues: finalAnswers,
        questions: currentQuestions,
        status: 'completed',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        aiAnalysis: aiResult.analysis,
        recoveredMemory: aiResult.recoveredMemory,
      };

      await MemoryStorage.saveMemory(newMemory);
      await loadMemories();

      Alert.alert('기억 복원 완료', '기록이 저장되었습니다.');
      setDescription('');
      setCurrentQuestions([]);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setCurrentAnswer('');
      setIsRecovering(false);
    } catch {
      Alert.alert('오류', '기억 복원 저장 중 오류가 발생했습니다.');
      setIsRecovering(false);
    }
  };

  const handleDeleteMemory = (id: string) => {
    Alert.alert('삭제', '이 기억 복원 기록을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await MemoryStorage.deleteMemory(id);
          await loadMemories();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>기억 복원</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            질문을 따라가며 흐릿한 장면을 되살려보세요
          </Text>
        </View>

        <View style={styles.content}>
          {!isRecovering ? (
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>기억하고 싶은 상황</Text>
              <TextInput
                style={[
                  styles.descriptionInput,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                placeholder="예: 어린 시절 바닷가에서 뭔가 잃어버린 기억..."
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: colors.primary }, isGeneratingQuestions && { opacity: 0.6 }]}
                onPress={handleStartRecovery}
                disabled={isGeneratingQuestions}
              >
                <Ionicons name="search" size={20} color="#fff" />
                <Text style={styles.startButtonText}>
                  {isGeneratingQuestions ? '질문 생성 중...' : '기억 복원 시작'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.recoveryContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.recoveryTitle, { color: colors.text }]}>기억 복원 중</Text>
              <Text style={{ color: colors.textSecondary, marginBottom: 16 }}>
                {currentQuestionIndex + 1} / {currentQuestions.length}
              </Text>
              <View style={[styles.questionContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.questionText, { color: colors.text }]}>
                  {currentQuestions[currentQuestionIndex]}
                </Text>
              </View>
              <TextInput
                style={[
                  styles.answerInput,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                placeholder="답변을 입력하세요..."
                placeholderTextColor={colors.textSecondary}
                value={currentAnswer}
                onChangeText={setCurrentAnswer}
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.success }]}
                onPress={handleAnswerQuestion}
              >
                <Text style={styles.submitButtonText}>답변 완료</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 28 }]}>복원 기록</Text>
          {memories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, marginTop: 12 }}>아직 기록이 없습니다</Text>
            </View>
          ) : (
            memories.map((memory) => (
              <View
                key={memory.id}
                style={[styles.memoryItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.memoryHeader}>
                  <Text style={[styles.memoryDate, { color: colors.text }]}>
                    {formatRelativeDate(memory.date)}
                  </Text>
                  <TouchableOpacity onPress={() => handleDeleteMemory(memory.id)}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.memoryDescription, { color: colors.text }]} numberOfLines={2}>
                  {memory.description}
                </Text>
                {memory.aiAnalysis ? (
                  <Text style={[styles.analysis, { color: colors.primary }]} numberOfLines={3}>
                    {memory.aiAnalysis}
                  </Text>
                ) : null}
                {memory.recoveredMemory ? (
                  <Text style={[styles.recovered, { color: colors.success }]} numberOfLines={3}>
                    {memory.recoveredMemory}
                  </Text>
                ) : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  headerSubtitle: { fontSize: 14 },
  content: { padding: 20, paddingTop: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  descriptionInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 110,
    marginBottom: 16,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  startButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  recoveryContainer: { borderRadius: 12, padding: 20, borderWidth: 1 },
  recoveryTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  questionContainer: { borderRadius: 8, padding: 16, marginBottom: 16 },
  questionText: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
  answerInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    minHeight: 80,
    marginBottom: 12,
  },
  submitButton: { padding: 12, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontWeight: '700' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  memoryItem: { borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1 },
  memoryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  memoryDate: { fontWeight: '600' },
  memoryDescription: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  analysis: { fontSize: 12, lineHeight: 18, marginBottom: 6 },
  recovered: { fontSize: 12, lineHeight: 18 },
});
