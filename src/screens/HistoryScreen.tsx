import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  RefreshControl,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { DreamStorage, DreamRecord } from '../services/DreamStorage';
import {
  formatRelativeDate,
  getDreamTypeLabel,
  getEmotionLabel,
} from '../utils/dreamHelpers';
import DreamDetailModal from './DreamDetailModal';
import EmotionIcon from '../components/EmotionIcon';
import { LinearGradient } from 'expo-linear-gradient';
import DreamPageHeader, { DreamEmptyState } from '../components/DreamPageHeader';
import { dreamLayout } from '../constants/DreamDesign';
import { getDreamScene } from '../utils/dreamWorld';
import { getDreamArtwork } from '../components/dreamArtwork';

type FilterMode = 'all' | 'favorite' | 'lucid' | 'nightmare';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [dreams, setDreams] = useState<DreamRecord[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [selected, setSelected] = useState<DreamRecord | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [readError, setReadError] = useState(false);
  const request = useRef(0);

  const loadDreams = useCallback(async () => {
    const requestId = ++request.current;
    try {
      let data = query.trim()
        ? await DreamStorage.searchDreams(query)
        : await DreamStorage.getDreams();

      if (filter === 'favorite') data = data.filter((d) => d.isFavorite);
      if (filter === 'lucid') data = data.filter((d) => d.dreamType === 'lucid');
      if (filter === 'nightmare') data = data.filter((d) => d.dreamType === 'nightmare');

      if (requestId === request.current) { setDreams(data); setReadError(false); }
    } catch (error) {
      console.error('꿈 기록 불러오기 오류:', error);
      if (requestId === request.current) setReadError(true);
    }
  }, [query, filter]);

  useFocusEffect(
    useCallback(() => {
      loadDreams();
      return () => { request.current++; };
    }, [loadDreams])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDreams();
    setRefreshing(false);
  };

  const filters: { key: FilterMode; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'favorite', label: '즐겨찾기' },
    { key: 'lucid', label: '자각몽' },
    { key: 'nightmare', label: '악몽' },
  ];

  const renderDreamItem = ({ item }: { item: DreamRecord }) => (
    <TouchableOpacity
      style={[styles.dreamItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => setSelected(item)}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${formatRelativeDate(item.date)} 꿈 기록 열기, 감정 ${getEmotionLabel(item.emotion)}, ${item.content.slice(0, 40)}`}
    >
      <ImageBackground source={getDreamArtwork(item.content, item.matchedSymbols)} style={styles.cover}>
        <LinearGradient colors={['transparent', '#0B1426CC']} style={styles.coverShade}>
          <Text style={styles.coverTitle}>{getDreamScene(item.content, item.matchedSymbols).title}</Text>
        </LinearGradient>
      </ImageBackground>
      <View style={styles.entryBody}>
      <View style={styles.dreamHeader}>
        <View style={styles.dreamInfo}>
          <Text style={[styles.dreamDate, { color: colors.text }]}>{formatRelativeDate(item.date)}</Text>
          <EmotionIcon emotion={item.emotion} size={20} />
          {item.isFavorite && <Ionicons name="heart" size={14} color={colors.error} />}
        </View>
        <Text style={[styles.typeLabel, { color: colors.textSecondary }]}>
          {getDreamTypeLabel(item.dreamType)}
        </Text>
      </View>

      <Text style={[styles.dreamContent, { color: colors.text }]} numberOfLines={3}>
        {item.content}
      </Text>

      <View style={styles.dreamFooter}>
        <View style={styles.confidenceContainer}>
          <Ionicons name="analytics-outline" size={14} color={colors.primary} />
          <Text style={[styles.confidenceText, { color: colors.textSecondary }]}>
            {item.interpretation ? `해석 참고 ${Math.round(item.confidence * 100)}%` : '기록만 저장됨'}
          </Text>
        </View>
        {item.matchedSymbols && item.matchedSymbols.length > 0 ? (
          <Text style={[styles.symbolHint, { color: colors.accent }]} numberOfLines={1}>
            {item.matchedSymbols.slice(0, 2).join(' · ')}
          </Text>
        ) : item.interpretation ? (
          <View style={styles.interpretationBadge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <Text style={[styles.interpretationText, { color: colors.success }]}>해석 완료</Text>
          </View>
        ) : null}
      </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <DreamPageHeader title="꿈 앨범" subtitle="밤마다 모아둔 나의 이야기" />

      <View style={dreamLayout.column}>
      <View
        style={[
          styles.searchBox,
          { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder },
        ]}
      >
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="내용·태그·해석 검색"
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          accessibilityLabel="꿈 기록 검색"
        />
        {query ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="검색어 지우기" onPress={() => setQuery('')} style={{ padding: 4 }}><Ionicons name="close-circle" size={20} color={colors.textSecondary} /></TouchableOpacity> : null}
      </View>

      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f.key ? colors.accent : colors.surface,
                borderColor: filter === f.key ? colors.accent : colors.border,
              },
            ]}
            onPress={() => setFilter(f.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === f.key }}
          >
            <Text
              style={{
                color: filter === f.key ? colors.onAccent : colors.text,
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {readError ? <Text accessibilityRole="alert" style={{ color: colors.error, paddingHorizontal: 24, paddingBottom: 12 }}>기록을 읽지 못했어요. 기존 데이터는 보존됩니다. 아래로 당겨 다시 시도해주세요.</Text> : null}
      </View>

      <FlatList
        data={dreams}
        renderItem={renderDreamItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[dreamLayout.column, styles.listContainer, dreams.length === 0 && styles.emptyListContainer]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <DreamEmptyState title={readError ? '꿈을 다시 불러와주세요' : query || filter !== 'all' ? '아직 찾는 꿈이 없어요' : '첫 번째 꿈을 기다려요'} description={query || filter !== 'all' ? '검색어나 필터를 바꿔 다른 꿈을 찾아보세요.' : '해석 탭에서 꿈을 남기면 이곳에 한 장씩 모여요.'} />
        }
        showsVerticalScrollIndicator={false}
      />

      <DreamDetailModal
        dream={selected}
        visible={!!selected}
        onClose={() => setSelected(null)}
        onChanged={async () => {
          await loadDreams();
          if (selected) {
            const updated = await DreamStorage.getDreamById(selected.id);
            setSelected(updated);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  headerSubtitle: { fontSize: 14 },
  searchBox: {
    marginHorizontal: 24,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  listContainer: { padding: 24, paddingTop: 4, paddingBottom: 32 },
  emptyListContainer: { flexGrow: 1, justifyContent: 'center' },
  dreamItem: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
  },
  cover: { height: 132, justifyContent: 'flex-end' },
  coverShade: { padding: 18, paddingTop: 36 },
  coverTitle: { fontSize: 18, fontWeight: '700', color: '#F7F1E5' },
  entryBody: { padding: 20 },
  dreamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dreamInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dreamDate: { fontSize: 14, fontWeight: '600', marginRight: 4 },
  typeLabel: { fontSize: 12 },
  dreamContent: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  dreamFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceContainer: { flexDirection: 'row', alignItems: 'center' },
  confidenceText: { fontSize: 12, marginLeft: 4, fontWeight: '500' },
  interpretationBadge: { flexDirection: 'row', alignItems: 'center' },
  interpretationText: { fontSize: 12, marginLeft: 4, fontWeight: '500' },
  symbolHint: { fontSize: 12, fontWeight: '600', maxWidth: '55%' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
});
