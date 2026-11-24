import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { DreamRecord, DreamStorage } from '../services/DreamStorage';
import { ShareService } from '../services/ShareService';
import { LocalAIService } from '../services/LocalAIService';
import { dreamInterpreter } from '../services/DreamInterpreter';
import { APP_CONFIG, EMOTIONS } from '../constants/AppConfig';
import DreamEvidence from '../components/DreamEvidence';
import DreamSceneCard from '../components/DreamSceneCard';
import EmotionIcon from '../components/EmotionIcon';
import { dreamLayout } from '../constants/DreamDesign';
import {
  formatFullDate,
  getDreamTypeLabel,
  getEmotionLabel,
} from '../utils/dreamHelpers';

interface Props {
  dream: DreamRecord | null;
  visible: boolean;
  onClose: () => void;
  onChanged?: () => void;
}

export default function DreamDetailModal({ dream: initial, visible, onClose, onChanged }: Props) {
  const { colors } = useTheme();
  const [updated, setUpdated] = useState<DreamRecord | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const analysisLock = useRef(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editEmotion, setEditEmotion] = useState('');
  const [editTags, setEditTags] = useState('');
  const [saving, setSaving] = useState(false);
  const saveLock = useRef(false);
  const dream = initial && updated?.id === initial.id ? updated : initial;

  if (!dream) return null;

  const analyzeSavedDream = async () => {
    if (analysisLock.current) return;
    if (dream.content.trim().length < APP_CONFIG.minDreamLength) {
      Alert.alert('꿈 내용이 짧아요', `해석하려면 ${APP_CONFIG.minDreamLength}자 이상의 기록이 필요해요.`);
      return;
    }
    analysisLock.current = true;
    setAnalyzing(true);
    try {
      const status = await LocalAIService.getStatus();
      const result = await dreamInterpreter.analyzeDream(dream.content, dream.emotion, !status.available);
      const saved = await DreamStorage.saveAnalysis(dream.id, dream.content, dream.emotion, {
        interpretation: result.interpretation, confidence: result.confidence,
        recommendations: result.recommendations, themes: result.themes, matchedSymbols: result.matchedSymbols,
      });
      if (saved) {
        setUpdated(saved);
        onChanged?.();
      }
    } catch {
      Alert.alert('해석하지 못했어요', '꿈 기록은 그대로 남아 있어요.');
    } finally {
      analysisLock.current = false;
      setAnalyzing(false);
    }
  };

  const beginEdit = () => {
    setEditContent(dream.content); setEditEmotion(dream.emotion);
    setEditTags((dream.tags ?? []).join(', ')); setEditing(true);
  };
  const saveEdit = async () => {
    if (saveLock.current || !editContent.trim()) return;
    saveLock.current = true; setSaving(true);
    try {
      const saved = await DreamStorage.updateDream(dream.id, {
        content: editContent.trim(), emotion: editEmotion,
        tags: [...new Set(editTags.split(',').map(t => t.trim()).filter(Boolean))].slice(0, 10),
      });
      if (!saved) throw Error('Missing record');
      setUpdated(saved); setEditing(false); onChanged?.();
    } catch { Alert.alert('수정하지 못했어요', '입력 내용은 편집 화면에 남아 있어요.'); }
    finally { saveLock.current = false; setSaving(false); }
  };
  const close = () => {
    if (saving || analyzing) return;
    if (editing) {
      Alert.alert('편집을 닫을까요?', '저장하지 않은 수정은 반영되지 않아요.', [
        { text: '계속 편집', style: 'cancel' },
        { text: '닫기', onPress: () => { setEditing(false); onClose(); } },
      ]);
    } else onClose();
  };

  const toggleFavorite = async () => {
    await DreamStorage.toggleFavorite(dream.id);
    setUpdated(await DreamStorage.getDreamById(dream.id));
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
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="꿈 상세 닫기" style={styles.closeButton} onPress={close} disabled={saving || analyzing}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>꿈 한 장</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="꿈 기록 수정" style={styles.iconBtn}
              disabled={saving || analyzing || editing} onPress={beginEdit}>
              <Ionicons name="create-outline" size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={dream.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'} onPress={toggleFavorite} style={styles.iconBtn}>
              <Ionicons
                name={dream.isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={dream.isFavorite ? colors.error : colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="꿈 공유하기" onPress={handleShare} style={styles.iconBtn}>
              <Ionicons name="share-outline" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={dreamLayout.body}>
          {editing && <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>꿈 기록 수정</Text>
            <TextInput accessibilityLabel="수정할 꿈 내용" value={editContent} onChangeText={setEditContent}
              editable={!saving} maxLength={5000} multiline textAlignVertical="top"
              style={{ color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, minHeight: 150, fontSize: 16 }} />
            <Text style={{ color: colors.textSecondary }}>감정</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {[{ key: '', label: '선택 안 함' }, ...EMOTIONS].map(e => <TouchableOpacity key={e.key}
                accessibilityRole="radio" accessibilityState={{ checked: editEmotion === e.key }}
                aria-checked={editEmotion === e.key} disabled={saving} onPress={() => setEditEmotion(e.key)}
                style={{ padding: 12, minHeight: 44, borderRadius: 12, backgroundColor: editEmotion === e.key ? colors.accent : colors.background }}>
                <Text style={{ color: editEmotion === e.key ? colors.onAccent : colors.text }}>{e.label}</Text>
              </TouchableOpacity>)}
            </View>
            <TextInput accessibilityLabel="수정할 태그" value={editTags} onChangeText={setEditTags} editable={!saving}
              maxLength={2000} placeholder="태그를 쉼표로 구분" placeholderTextColor={colors.textSecondary}
              style={{ minHeight: 48, color: colors.text, padding: 12 }} />
            <TouchableOpacity accessibilityRole="button" disabled={saving || !editContent.trim()} onPress={saveEdit} style={{ minHeight: 48, justifyContent: 'center' }}>
              <Text style={{ color: colors.accent, fontWeight: '700' }}>{saving ? '저장 중…' : '수정 저장'}</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" disabled={saving} onPress={() => setEditing(false)} style={{ minHeight: 44, justifyContent: 'center' }}>
              <Text style={{ color: colors.textSecondary }}>수정 취소</Text>
            </TouchableOpacity>
          </View>}
          <Text style={[styles.date, { color: colors.textSecondary }]}>{formatFullDate(dream.date)}</Text>
          <DreamSceneCard content={dream.content} symbols={dream.matchedSymbols} />

          <View style={styles.metaRow}>
            <EmotionIcon emotion={dream.emotion} size={22} />
            <Text style={[styles.metaText, { color: colors.text }]}>{getEmotionLabel(dream.emotion)}</Text>
            {dream.dreamType ? (
              <View style={[styles.chip, { backgroundColor: colors.primary + '22' }]}>
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                  {getDreamTypeLabel(dream.dreamType)}
                </Text>
              </View>
            ) : null}
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

          {dream.interpretation ? <DreamEvidence content={dream.content} /> : null}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>해석</Text>
          {dream.interpretationStale && <Text style={{ color: colors.warning, lineHeight: 22 }}>
            수정 전 내용 기준의 해석이에요. 원할 때 다시 해석할 수 있어요.
          </Text>}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {dream.interpretation ? <Text style={[styles.content, { color: colors.text }]}>{dream.interpretation}</Text> : (
              <TouchableOpacity accessibilityRole="button" accessibilityState={{ busy: analyzing, disabled: analyzing }}
                disabled={analyzing} onPress={analyzeSavedDream} style={{ minHeight: 44, justifyContent: 'center' }}>
                <Text style={{ color: colors.accent, fontWeight: '700' }}>{analyzing ? '기기에서 해석 중…' : '이 꿈 해석하기'}</Text>
              </TouchableOpacity>
            )}
          </View>
          {dream.interpretationStale && !editing && <TouchableOpacity accessibilityRole="button"
            disabled={analyzing} onPress={analyzeSavedDream} style={{ minHeight: 48, justifyContent: 'center' }}>
            <Text style={{ color: colors.accent }}>{analyzing ? '다시 해석 중…' : '수정한 꿈 다시 해석하기'}</Text>
          </TouchableOpacity>}

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

          <TouchableOpacity disabled={editing || saving || analyzing} style={[styles.deleteBtn, { borderColor: colors.error }]} onPress={handleDelete}>
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
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 10, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  closeButton: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  body: { padding: 20, paddingBottom: 40 },
  date: { fontSize: 13, marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  metaText: { fontSize: 15, fontWeight: '600' },
  chip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  scoreRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 12 },
  content: { fontSize: 15, lineHeight: 24 },
  card: { borderWidth: 1, borderRadius: 22, padding: 20 },
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
