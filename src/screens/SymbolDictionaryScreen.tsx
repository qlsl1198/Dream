import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import {
  DREAM_CATEGORIES,
  DREAM_SYMBOLS,
  DreamSymbol,
  searchSymbols,
} from '../data/dreamSymbols';
import AdMobBanner from '../components/AdMobBanner';

export default function SymbolDictionaryScreen() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof DREAM_CATEGORIES)[number]>('전체');
  const [selected, setSelected] = useState<DreamSymbol | null>(null);

  const results = useMemo(() => searchSymbols(query, category), [query, category]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>꿈상징 사전</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {DREAM_SYMBOLS.length}개 상징 · 전통 + 심리 해석
        </Text>
      </View>

      <View style={[styles.searchBox, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="상징 검색 (예: 뱀, 물, 추락)"
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow} contentContainerStyle={styles.categoryContent}>
        {DREAM_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              {
                backgroundColor: category === cat ? colors.primary : colors.surface,
                borderColor: category === cat ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text style={{ color: category === cat ? '#fff' : colors.text, fontWeight: '600', fontSize: 13 }}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>검색 결과가 없습니다</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setSelected(item)}
            activeOpacity={0.75}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
              <View style={[styles.badge, { backgroundColor: colors.primary + '22' }]}>
                <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600' }}>{item.category}</Text>
              </View>
            </View>
            <Text style={[styles.cardPreview, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.psychological}
            </Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={<AdMobBanner adSize="BANNER" style={{ marginTop: 8 }} />}
      />

      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelected(null)}>
        {selected && (
          <SafeAreaView style={[styles.modal, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{selected.name}</Text>
              <View style={{ width: 24 }} />
            </View>
            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={[styles.badge, { backgroundColor: colors.primary + '22', alignSelf: 'flex-start', marginBottom: 16 }]}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>{selected.category}</Text>
              </View>

              <Text style={[styles.sectionLabel, { color: colors.text }]}>전통적 해석</Text>
              <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>{selected.traditional}</Text>

              <Text style={[styles.sectionLabel, { color: colors.text }]}>심리적 해석</Text>
              <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>{selected.psychological}</Text>

              <Text style={[styles.sectionLabel, { color: colors.text }]}>기록 팁</Text>
              {selected.tips.map((tip) => (
                <View key={tip} style={styles.tipRow}>
                  <View style={[styles.bullet, { backgroundColor: colors.accent }]} />
                  <Text style={[styles.sectionBody, { color: colors.textSecondary, flex: 1 }]}>{tip}</Text>
                </View>
              ))}

              <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
                ※ 해몽은 참고용이며 의학적·법적 조언이 아닙니다. 불안이 지속되면 전문가와 상담하세요.
              </Text>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4 },
  searchBox: {
    marginHorizontal: 20,
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  categoryRow: { maxHeight: 52, marginTop: 12 },
  categoryContent: { paddingHorizontal: 16, gap: 8 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  list: { padding: 20, paddingBottom: 40 },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  cardPreview: { fontSize: 13, lineHeight: 20 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 12 },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalBody: { padding: 20 },
  sectionLabel: { fontSize: 15, fontWeight: '700', marginBottom: 8, marginTop: 8 },
  sectionBody: { fontSize: 14, lineHeight: 22, marginBottom: 12 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 8, marginRight: 10 },
  disclaimer: { fontSize: 12, lineHeight: 18, marginTop: 20 },
});
