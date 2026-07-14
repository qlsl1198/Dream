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
import OpenAI from 'openai';
import { useTheme } from '../contexts/ThemeContext';
import { MemoryStorage, MemoryRecord } from '../services/MemoryStorage';
import { formatRelativeDate } from '../utils/dreamHelpers';

const FALLBACK_QUESTIONS = [
  '그때 누구와 함께 있었나요?',
  '어떤 계절이었나요?',
  '어디서 일어난 일인가요?',
  '그때 어떤 소리가 들렸나요?',
  '그때 어떤 기분이었나요?',
];

class AIMemoryRecovery {
  private openai: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (apiKey && apiKey !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    }
  }

  async generateQuestions(description: string): Promise<string[]> {
    if (!this.openai) return FALLBACK_QUESTIONS;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              '당신은 기억 복원 전문가입니다. 감각·시간·공간·감정·사회적 맥락을 자극하는 구체적 질문 5개를 한국어로, 한 줄씩만 작성합니다.',
          },
          {
            role: 'user',
            content: `상황: ${description}\n기억 복원을 위한 질문 5개만 출력하세요.`,
          },
        ],
        max_tokens: 400,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || '';
      const questions = response
        .split('\n')
        .map((l) => l.replace(/^[-*\d.)\s]+/, '').trim())
        .filter(Boolean)
        .slice(0, 5);
      return questions.length >= 3 ? questions : FALLBACK_QUESTIONS;
    } catch {
      return FALLBACK_QUESTIONS;
    }
  }

  async analyzeMemory(
    description: string,
    clues: string[]
  ): Promise<{ analysis: string; recoveredMemory: string }> {
    if (!this.openai) {
      return {
        analysis:
          '수집된 단서를 시간·장소·감정 순으로 다시 연결해보면 장면이 선명해질 수 있습니다.',
        recoveredMemory: clues.filter(Boolean).join(' / ') || '추가 단서가 필요합니다.',
      };
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              '당신은 기억 복원 전문가입니다. 한국어로 답하며 과장된 확신을 피합니다.',
          },
          {
            role: 'user',
            content: `원래 상황: ${description}\n단서:\n${clues
              .map((c, i) => `${i + 1}. ${c}`)
              .join('\n')}\n\n형식:\n1. 기억 분석:\n2. 복원된 기억:`,
          },
        ],
        max_tokens: 700,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || '';
      let analysis = '';
      let recoveredMemory = '';
      for (const line of response.split('\n')) {
        if (line.includes('분석')) analysis = line.split(':').slice(1).join(':').trim() || analysis;
        if (line.includes('복원')) recoveredMemory = line.split(':').slice(1).join(':').trim() || recoveredMemory;
      }
      if (!analysis) analysis = response;
      if (!recoveredMemory) recoveredMemory = '단서를 바탕으로 장면이 일부 복원되었습니다.';
      return { analysis, recoveredMemory };
    } catch {
      return {
        analysis: 'AI 분석 중 오류가 발생했습니다. 단서를 다시 살펴보세요.',
        recoveredMemory: '추가 단서가 필요할 수 있습니다.',
      };
    }
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
