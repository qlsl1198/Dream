import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { FeedbackService } from '../services/FeedbackService';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      Alert.alert('알림', '피드백 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await FeedbackService.saveSuggestion({
        id: Date.now().toString(),
        content: feedback.trim(),
        type: 'suggestion',
        date: new Date().toISOString(),
        status: 'pending',
      });

      Alert.alert(
        '피드백 전송 완료',
        '소중한 의견 감사합니다. 검토 후 반영하겠습니다.',
        [
          {
            text: '확인',
            onPress: () => {
              setFeedback('');
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error('피드백 저장 오류:', error);
      Alert.alert('오류', '피드백 전송 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (feedback.trim()) {
      Alert.alert(
        '작성 중인 내용이 있습니다',
        '정말 닫으시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '닫기',
            style: 'destructive',
            onPress: () => {
              setFeedback('');
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>개발자에게 건의</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.introSection}>
            <Ionicons name="bulb-outline" size={48} color={colors.primary} />
            <Text style={[styles.introTitle, { color: colors.text }]}>
              소중한 의견을 들려주세요
            </Text>
            <Text style={[styles.introText, { color: colors.textSecondary }]}>
              앱 개선을 위한 아이디어, 버그 신고, 새로운 기능 제안 등 무엇이든 환영합니다.
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              피드백 내용
            </Text>
            <TextInput
              style={[styles.textInput, {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.text,
              }]}
              placeholder="개선하고 싶은 점이나 새로운 기능 아이디어를 자유롭게 적어주세요..."
              placeholderTextColor={colors.textSecondary}
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={[styles.characterCount, { color: colors.textSecondary }]}>
              {feedback.length}/1000
            </Text>
          </View>

          <View style={styles.tipsSection}>
            <Text style={[styles.tipsTitle, { color: colors.text }]}>
              💡 피드백 작성 팁
            </Text>
            <View style={styles.tipItem}>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                • 구체적인 상황이나 문제점을 설명해주세요
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                • 개선 방향이나 원하는 기능을 제안해주세요
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                • 버그 신고 시 재현 방법을 알려주세요
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: colors.primary },
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || !feedback.trim()}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isSubmitting ? "hourglass-outline" : "send"}
              size={20}
              color="#fff"
            />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? '전송 중...' : '피드백 전송'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  introSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    maxHeight: 200,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  tipsSection: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipItem: {
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default FeedbackModal;
