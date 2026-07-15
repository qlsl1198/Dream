import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { DreamRecord, DreamStorage } from '../services/DreamStorage';
import { ShareService } from '../services/ShareService';
import {
  formatFullDate,
  getDreamTypeLabel,
  getEmotionEmoji,
  getEmotionLabel,
} from '../utils/dreamHelpers';

interface Props {
  dream: DreamRecord | null;
  visible: boolean;
  onClose: () => void;
  onChanged?: () => void;
}

export default function DreamDetailModal({ dream, visible, onClose, onChanged }: Props) {
  const { colors } = useTheme();

  if (!dream) return null;

  const toggleFavorite = async () => {
    await DreamStorage.toggleFavorite(dream.id);
    onChanged?.();
  };

  const handleShare = async () => {
    try {
      await ShareService.shareDream(dream);
    } catch {
      Alert.alert('오류', '공유 중 문제가 발생했습니다.');
    }
  };

  const handleDelete = () => {
    Alert.alert('꿈 기록 삭제', '이 꿈 기록을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await DreamStorage.deleteDream(dream.id);
          onChanged?.();
          onClose();
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>꿈 상세</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={toggleFavorite} style={styles.iconBtn}>
              <Ionicons
                name={dream.isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={dream.isFavorite ? colors.error : colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
              <Ionicons name="share-outline" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{formatFullDate(dream.date)}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaEmoji}>{getEmotionEmoji(dream.emotion)}</Text>
            <Text style={[styles.metaText, { color: colors.text }]}>{getEmotionLabel(dream.emotion)}</Text>
            {dream.dreamType ? (
              <View style={[styles.chip, { backgroundColor: colors.primary + '22' }]}>
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                  {getDreamTypeLabel(dream.dreamType)}
                </Text>
              </View>
            ) : null}
            <View style={[styles.chip, { backgroundColor: colors.success + '22' }]}>
              <Text style={{ color: colors.success, fontSize: 12, fontWeight: '600' }}>
                신뢰도 {Math.round(dream.confidence * 100)}%
              </Text>
            </View>
          </View>

          {(dream.vividness || dream.sleepQuality) && (
            <View style={styles.scoreRow}>
              {dream.vividness ? (
                <Text style={{ color: colors.textSecondary }}>생생함 {dream.vividness}/10</Text>
              ) : null}
              {dream.sleepQuality ? (
                <Text style={{ color: colors.textSecondary }}>수면 {dream.sleepQuality}/10</Text>
              ) : null}
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: colors.text }]}>꿈 내용</Text>
          <Text style={[styles.content, { color: colors.text }]}>{dream.content}</Text>

          {dream.tags && dream.tags.length > 0 && (
            <View style={styles.tags}>
              {dream.tags.map((tag) => (
                <View key={tag} style={[styles.tag, { borderColor: colors.border }]}>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: colors.text }]}>해석</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.content, { color: colors.text }]}>{dream.interpretation}</Text>
          </View>

          {dream.matchedSymbols && dream.matchedSymbols.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>감지된 상징</Text>
              <View style={styles.tags}>
                {dream.matchedSymbols.map((s) => (
                  <View key={s} style={[styles.tag, { backgroundColor: colors.accent + '33', borderColor: colors.accent }]}>
                    <Text style={{ color: colors.text, fontSize: 12 }}>{s}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {dream.recommendations && dream.recommendations.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>추천 활동</Text>
              {dream.recommendations.map((r) => (
                <View key={r} style={styles.recoRow}>
                  <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.content, { color: colors.textSecondary, flex: 1 }]}>{r}</Text>
                </View>
              ))}
            </>
          )}

          {dream.notes ? (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>메모</Text>
              <Text style={[styles.content, { color: colors.textSecondary }]}>{dream.notes}</Text>
            </>
          ) : null}

          <TouchableOpacity style={[styles.deleteBtn, { borderColor: colors.error }]} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
            <Text style={{ color: colors.error, fontWeight: '600', marginLeft: 8 }}>기록 삭제</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 4, marginLeft: 8 },
  body: { padding: 20, paddingBottom: 40 },
  date: { fontSize: 13, marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  metaEmoji: { fontSize: 20 },
  metaText: { fontSize: 15, fontWeight: '600' },
  chip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  scoreRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  content: { fontSize: 15, lineHeight: 24 },
  card: { borderWidth: 1, borderRadius: 12, padding: 14 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  tag: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  recoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 9, marginRight: 10 },
  deleteBtn: {
    marginTop: 28,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
