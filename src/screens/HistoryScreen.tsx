import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { DreamStorage, DreamRecord } from '../services/DreamStorage';
import {
  formatRelativeDate,
  getDreamTypeLabel,
  getEmotionEmoji,
} from '../utils/dreamHelpers';
import DreamDetailModal from './DreamDetailModal';

type FilterMode = 'all' | 'favorite' | 'lucid' | 'nightmare';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [dreams, setDreams] = useState<DreamRecord[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [selected, setSelected] = useState<DreamRecord | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDreams = useCallback(async () => {
    try {
      let data = query.trim()
        ? await DreamStorage.searchDreams(query)
        : await DreamStorage.getDreams();

      if (filter === 'favorite') data = data.filter((d) => d.isFavorite);
      if (filter === 'lucid') data = data.filter((d) => d.dreamType === 'lucid');
      if (filter === 'nightmare') data = data.filter((d) => d.dreamType === 'nightmare');

      setDreams(data);
    } catch (error) {
      console.error('꿈 기록 불러오기 오류:', error);
    }
  }, [query, filter]);

  useFocusEffect(
    useCallback(() => {
      loadDreams();
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
    >
      <View style={styles.dreamHeader}>
        <View style={styles.dreamInfo}>
          <Text style={[styles.dreamDate, { color: colors.text }]}>{formatRelativeDate(item.date)}</Text>
          <Text style={styles.dreamEmotion}>{getEmotionEmoji(item.emotion)}</Text>
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
            {Math.round(item.confidence * 100)}%
          </Text>
        </View>
        {item.matchedSymbols && item.matchedSymbols.length > 0 ? (
          <Text style={[styles.symbolHint, { color: colors.accent }]} numberOfLines={1}>
            {item.matchedSymbols.slice(0, 2).join(' · ')}
          </Text>
        ) : (
          <View style={styles.interpretationBadge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <Text style={[styles.interpretationText, { color: colors.success }]}>해석 완료</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>꿈 기록</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {dreams.length}개의 기록
        </Text>
      </View>

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
        />
      </View>

      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f.key ? colors.primary : colors.surface,
                borderColor: filter === f.key ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={{
                color: filter === f.key ? '#fff' : colors.text,
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={dreams}
        renderItem={renderDreamItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContainer, dreams.length === 0 && styles.emptyListContainer]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="moon-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>아직 꿈 기록이 없습니다</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              첫 꿈을 기록하고 해석해보세요
            </Text>
          </View>
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
    marginHorizontal: 20,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  listContainer: { padding: 20, paddingTop: 4 },
  emptyListContainer: { flex: 1, justifyContent: 'center' },
  dreamItem: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  dreamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dreamInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dreamDate: { fontSize: 14, fontWeight: '600', marginRight: 4 },
  dreamEmotion: { fontSize: 16 },
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
