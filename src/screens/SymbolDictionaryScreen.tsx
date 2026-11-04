import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Modal, ScrollView, Image, ImageBackground, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { DREAM_CATEGORIES, DREAM_SYMBOLS, DreamSymbol, searchSymbols } from '../data/dreamSymbols';
import DreamPageHeader, { DreamEmptyState } from '../components/DreamPageHeader';
import { dreamLayout } from '../constants/DreamDesign';
import { getSymbolColumns, getSymbolVisual } from '../utils/symbolVisuals';

const CLOUD = require('../../assets/dream-world/symbol-clouds.png');
const BOOK = require('../../assets/dream-world/symbol-book.png');
const LAKE = require('../../assets/dream-world/moon-lake.png');
const GARDEN = require('../../assets/dream-world/moon-garden.png');

function SymbolPicture({ symbol, large = false }: { symbol: DreamSymbol; large?: boolean }) {
  const visual = getSymbolVisual(symbol.id, symbol.category);
  const landscape = large ? visual.landscape : undefined;
  return <ImageBackground source={landscape === 'lake' ? LAKE : landscape === 'garden' ? GARDEN : CLOUD}
    style={[styles.picture, large && styles.largePicture]} imageStyle={styles.pictureImage} accessible={false}>
    {!landscape && <View style={[styles.pictureTint, { backgroundColor: `${visual.tint}20` }]} />}
    <View style={landscape ? styles.landscapeSymbol : undefined}>
      <MaterialCommunityIcons name={visual.icon} size={landscape ? 30 : large ? 76 : 48} color="#F4DEAE" />
    </View>
  </ImageBackground>;
}

const SymbolCard = memo(function SymbolCard({ symbol, onSelect, cardWidth }: { symbol: DreamSymbol; onSelect: (symbol: DreamSymbol) => void; cardWidth: number }) {
  const { colors } = useTheme();
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${symbol.name} 상징 자세히 보기`}
    onPress={() => onSelect(symbol)} activeOpacity={0.75} style={[styles.card, { width: cardWidth, maxWidth: cardWidth, backgroundColor: colors.surface, borderColor: colors.border }]}>
    <SymbolPicture symbol={symbol} />
    <Text style={[styles.cardCategory, { color: colors.textSecondary }]}>{symbol.category}</Text>
    <Text style={[styles.cardTitle, { color: colors.text }]}>{symbol.name}</Text>
    <Text style={[styles.keywords, { color: colors.textSecondary }]} numberOfLines={2}>{symbol.keywords.slice(0, 3).join(' · ')}</Text>
  </TouchableOpacity>;
});

export default function SymbolDictionaryScreen() {
  const { colors } = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const columns = getSymbolColumns(width, fontScale);
  const cardWidth = (Math.min(width, 760) - 48 - (columns - 1) * 12) / columns;
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof DREAM_CATEGORIES)[number]>('전체');
  const [selected, setSelected] = useState<DreamSymbol | null>(null);
  const list = useRef<FlatList<DreamSymbol>>(null);
  const results = useMemo(() => searchSymbols(query, category), [query, category]);
  const showIntro = !query.trim() && category === '전체';
  useEffect(() => { list.current?.scrollToOffset({ offset: 0, animated: false }); }, [category, columns]);

  const listHeader = <>
    <DreamPageHeader title="꿈 상징 도감" subtitle="꿈속의 단서를 한 장씩 펼쳐보세요" />
    <View style={dreamLayout.column}>
      {showIntro && <View style={[styles.intro, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.introCopy}>
          <Text style={[styles.introTitle, { color: colors.accent }]}>{DREAM_SYMBOLS.length}개의 꿈속 단서</Text>
          <Text style={[styles.introText, { color: colors.textSecondary }]}>궁금한 상징을 찾아보세요</Text>
        </View>
        <Image source={BOOK} style={styles.book} resizeMode="contain" accessible={false} />
      </View>}
      <View style={[styles.searchBox, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
        <Ionicons name="search-outline" size={21} color={colors.textSecondary} />
        <TextInput style={[styles.searchInput, { color: colors.text }]} placeholder="어떤 상징이 궁금한가요?"
          placeholderTextColor={colors.textSecondary} value={query} onChangeText={setQuery} accessibilityLabel="꿈 상징 검색" returnKeyType="search" />
        {query ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="검색어 지우기" onPress={() => setQuery('')} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
        </TouchableOpacity> : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow} contentContainerStyle={styles.categoryContent}>
        {DREAM_CATEGORIES.map(cat => <TouchableOpacity key={cat} accessibilityRole="button" accessibilityState={{ selected: category === cat }}
          onPress={() => setCategory(cat)} style={[styles.categoryChip, { backgroundColor: category === cat ? colors.accent : colors.surface, borderColor: category === cat ? colors.accent : colors.border }]}>
          <Text style={{ color: category === cat ? colors.onAccent : colors.text, fontSize: 13, fontWeight: '600' }}>{cat}</Text>
        </TouchableOpacity>)}
      </ScrollView>
    </View>
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsTitle, { color: colors.text }]}>{query.trim() ? '찾은 상징' : category === '전체' ? '모든 상징' : `${category} 상징`}</Text>
        <Text accessibilityLiveRegion="polite" style={[styles.resultCount, { color: colors.textSecondary }]}>{results.length}개</Text>
      </View>
    </>;
  return <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
    <FlatList key={columns} ref={list} data={results} numColumns={columns} keyExtractor={item => item.id}
      columnWrapperStyle={columns > 1 ? styles.gridRow : undefined} showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled" contentContainerStyle={[dreamLayout.column, styles.list]}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={<DreamEmptyState title="아직 찾는 상징이 없어요" description="다른 단어나 분류로 다시 찾아보세요." />}
      renderItem={({ item }) => <View style={columns === 1 ? styles.singleCard : undefined}><SymbolCard symbol={item} cardWidth={cardWidth} onSelect={setSelected} /></View>} />
    <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelected(null)}>
      {selected && <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="상징 상세 닫기" style={styles.closeButton} onPress={() => setSelected(null)}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>상징 한 장</Text><View style={styles.closeButton} />
        </View>
        <ScrollView contentContainerStyle={dreamLayout.body} showsVerticalScrollIndicator={false}>
          <Text style={[styles.detailCategory, { color: colors.accent }]}>{selected.category}</Text>
          <Text accessibilityRole="header" style={[styles.detailTitle, { color: colors.text }]}>{selected.name}</Text>
          <SymbolPicture symbol={selected} large />
          <Text style={[styles.sectionLabel, { color: colors.accent }]}>전통적 해석</Text>
          <Text style={[styles.sectionBody, { color: colors.text }]}>{selected.traditional}</Text>
          <Text style={[styles.sectionLabel, { color: colors.accent }]}>심리적 해석</Text>
          <Text style={[styles.sectionBody, { color: colors.text }]}>{selected.psychological}</Text>
          <Text style={[styles.sectionLabel, { color: colors.accent }]}>기록 팁</Text>
          {selected.tips.map((tip, index) => <View key={tip} style={[styles.tipRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.tipNumber, { backgroundColor: colors.border }]}><Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>{index + 1}</Text></View>
            <Text style={[styles.tipText, { color: colors.text }]}>{tip}</Text>
          </View>)}
          <View style={[styles.disclaimer, { borderTopColor: colors.border }]}>
            <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>해몽은 상징을 돌아보기 위한 참고입니다. 같은 꿈도 개인의 경험과 상황에 따라 다르게 느껴질 수 있으며, 의학적·법적 조언이나 예언이 아닙니다.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>}
    </Modal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  intro: { marginHorizontal: 24, marginBottom: 16, paddingLeft: 18, paddingRight: 8, paddingVertical: 8, borderRadius: 22, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  introCopy: { flex: 1, paddingVertical: 10 },
  introTitle: { fontSize: 20, fontWeight: '700', lineHeight: 28 },
  introText: { fontSize: 12, lineHeight: 20, marginTop: 5 },
  book: { width: '32%', maxWidth: 138, height: 94, marginLeft: 6 },
  searchBox: { marginHorizontal: 24, borderRadius: 16, borderWidth: 1, paddingLeft: 14, paddingRight: 8, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52 },
  searchInput: { flex: 1, minWidth: 0, fontSize: 15, paddingVertical: 8, paddingHorizontal: 0 },
  clearButton: { width: 36, minHeight: 40, justifyContent: 'center', alignItems: 'center' },
  categoryRow: { maxHeight: 64, marginTop: 16 },
  categoryContent: { paddingHorizontal: 24, paddingBottom: 8, gap: 8 },
  categoryChip: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, minHeight: 44, justifyContent: 'center' },
  list: { paddingBottom: 40 },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, paddingTop: 16, paddingHorizontal: 24 },
  resultsTitle: { fontSize: 18, lineHeight: 26, fontWeight: '700' },
  resultCount: { fontSize: 13 },
  gridRow: { gap: 12, paddingHorizontal: 24 },
  singleCard: { paddingHorizontal: 24 },
  card: { minWidth: 0, borderRadius: 22, borderWidth: 1, padding: 12, marginBottom: 14 },
  picture: { height: 94, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  pictureImage: { borderRadius: 16 },
  pictureTint: { ...StyleSheet.absoluteFillObject },
  cardCategory: { fontSize: 11, lineHeight: 17, marginTop: 12 },
  cardTitle: { fontSize: 19, lineHeight: 27, fontWeight: '700', marginTop: 2 },
  keywords: { fontSize: 11, lineHeight: 18, marginTop: 6, minHeight: 36 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  closeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  detailCategory: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  detailTitle: { fontSize: 34, lineHeight: 44, fontWeight: '700', marginBottom: 20 },
  largePicture: { height: 190, borderRadius: 22, marginBottom: 6 },
  landscapeSymbol: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#0B1426AA', padding: 9, borderRadius: 30 },
  sectionLabel: { fontSize: 20, lineHeight: 28, fontWeight: '700', marginTop: 26, marginBottom: 12 },
  sectionBody: { fontSize: 15, lineHeight: 27 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10 },
  tipNumber: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  tipText: { flex: 1, fontSize: 14, lineHeight: 24 },
  disclaimer: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 24, paddingTop: 20 },
  disclaimerText: { fontSize: 12, lineHeight: 21 },
});
