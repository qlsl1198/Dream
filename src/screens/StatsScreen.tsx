import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AdMobBanner from '../components/AdMobBanner';
import { useTheme } from '../contexts/ThemeContext';
import { DreamStorage, DreamRecord } from '../services/DreamStorage';
import { StreakService, StreakInfo } from '../services/StreakService';
import { getEmotionColor, getEmotionLabel, extractKeywords } from '../utils/dreamHelpers';
import EmotionIcon from '../components/EmotionIcon';
import DreamPageHeader from '../components/DreamPageHeader';
import DreamJourneyBanner from '../components/DreamJourneyBanner';
import { dreamLayout } from '../constants/DreamDesign';
import DreamConstellation from '../components/DreamConstellation';
import DreamDetailModal from './DreamDetailModal';
import { getConstellationMap, getConstellationRecords } from '../utils/constellation';

interface DreamStats {
  totalDreams: number;
  emotionStats: { [key: string]: number };
  recordedDays: number;
  mostCommonThemes: { theme: string; ids: string[] }[];
  dreamFrequency: number;
  lucidCount: number;
  nightmareCount: number;
}
const EMPTY_STATS: DreamStats = { totalDreams: 0, emotionStats: {}, recordedDays: 0, mostCommonThemes: [], dreamFrequency: 0, lucidCount: 0, nightmareCount: 0 };

export default function StatsScreen() {
  const { colors } = useTheme();
  const [dreams, setDreams] = useState<DreamRecord[]>([]);
  const [archiveChapter, setArchiveChapter] = useState<number | undefined>();
  const [openedDreamId, setOpenedDreamId] = useState<string | null>(null);
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null);
  const byId = useMemo(() => new Map(dreams.map(d => [d.id, d])), [dreams]);
  const latestChapter = getConstellationMap(dreams.length).chapter;
  const chapter = Math.min(latestChapter, archiveChapter ?? latestChapter);
  const stars = useMemo(() => getConstellationRecords(dreams, chapter), [dreams, chapter]);
  const [stats, setStats] = useState<DreamStats>(EMPTY_STATS);
  const [streak, setStreak] = useState<StreakInfo | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const load = useCallback(async () => {
    try {
    const savedDreams = await DreamStorage.getDreams();
    setDreams(savedDreams);
    setStreak(await StreakService.getStreakInfo());
    } catch { Alert.alert('통계 읽기 실패', '저장된 기록을 읽지 못했습니다. 기존 데이터는 보존됩니다.'); }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  React.useEffect(() => {
    if (dreams.length === 0) {
      setStats(EMPTY_STATS);
      return;
    }

    const now = new Date();
    let filtered = dreams;
    if (selectedPeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = dreams.filter((d) => new Date(d.date) >= weekAgo);
    } else if (selectedPeriod === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = dreams.filter((d) => new Date(d.date) >= monthAgo);
    }

    const emotionStats: Record<string, number> = {};
    filtered.forEach((dream) => {
      emotionStats[dream.emotion] = (emotionStats[dream.emotion] || 0) + 1;
    });

    const keywordRecords = new Map<string, string[]>();
    filtered.forEach((dream) => {
      for (const word of new Set([...extractKeywords(dream.content, 12), ...(dream.matchedSymbols ?? [])])) {
        const ids = keywordRecords.get(word);
        if (ids) ids.push(dream.id);
        else keywordRecords.set(word, [dream.id]);
      }
    });

    const mostCommonThemes = [...keywordRecords]
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5)
      .map(([theme, ids]) => ({ theme, ids }));

    const daysDiff = Math.max(
      1,
      (now.getTime() - new Date(filtered[filtered.length - 1]?.date || now).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    setStats({
      totalDreams: filtered.length,
      emotionStats,
      recordedDays: new Set(filtered.map(dream => dream.date)).size,
      mostCommonThemes,
      dreamFrequency: filtered.length / (daysDiff / 7),
      lucidCount: filtered.filter((d) => d.dreamType === 'lucid').length,
      nightmareCount: filtered.filter((d) => d.dreamType === 'nightmare').length,
    });
  }, [dreams, selectedPeriod]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <DreamPageHeader title="꿈의 여정" subtitle="기록 속에서 발견하는 작은 변화" />

      <View style={dreamLayout.column}>
      <View style={[styles.periodSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {(['week', 'month', 'year'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[styles.periodButton, selectedPeriod === period && { backgroundColor: colors.accent }]}
            onPress={() => { setExpandedTheme(null); setSelectedPeriod(period); }}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedPeriod === period }}
          >
            <Text style={{ color: selectedPeriod === period ? colors.onAccent : colors.text, fontWeight: '600', fontSize: 13 }}>
              {period === 'week' ? '1주' : period === 'month' ? '1개월' : '전체'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      </View>

      <ScrollView contentContainerStyle={[dreamLayout.body, { paddingTop: 0 }]} showsVerticalScrollIndicator={false}>
        <DreamJourneyBanner count={dreams.length} />
        {dreams.length > 0 && (
          <View style={[styles.chartContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>내 꿈 지도</Text>
            <DreamConstellation count={dreams.length} chapter={chapter} targets={stars} onOpen={setOpenedDreamId} />
            {latestChapter > 1 && <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              <TouchableOpacity accessibilityRole="button" disabled={chapter <= 1} onPress={() => setArchiveChapter(chapter - 1)} style={{ minHeight: 44, justifyContent: 'center', opacity: chapter <= 1 ? 0.5 : 1 }}>
                <Text style={{ color: colors.accent }}>이전 별자리</Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" disabled={chapter >= latestChapter} onPress={() => setArchiveChapter(chapter + 1)} style={{ minHeight: 44, justifyContent: 'center', opacity: chapter >= latestChapter ? 0.5 : 1 }}>
                <Text style={{ color: colors.accent }}>다음 별자리</Text>
              </TouchableOpacity>
            </View>}
          </View>
        )}
        {streak && (
          <View style={[styles.streakCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.streakItem}>
              <Ionicons name="flame-outline" size={22} color={colors.accent} />
              <Text style={[styles.streakValue, { color: colors.text }]}>{streak.currentStreak}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>연속 기록</Text>
            </View>
            <View style={styles.streakItem}>
              <Ionicons name="trophy-outline" size={22} color={colors.accent} />
              <Text style={[styles.streakValue, { color: colors.text }]}>{streak.longestStreak}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>최장 기록</Text>
            </View>
            <View style={styles.streakItem}>
              <Ionicons name="moon-outline" size={22} color={colors.accent} />
              <Text style={[styles.streakValue, { color: colors.text }]}>{streak.totalDreams}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>전체 꿈</Text>
            </View>
          </View>
        )}

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalDreams}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>기간 내 기록</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.recordedDays}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>기록한 날</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.dreamFrequency.toFixed(1)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>주당 환산(회)</Text>
          </View>
        </View>

        <Text style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 19, marginBottom: 20 }}>
          주당 환산은 선택 기간의 첫 기록부터 지금까지의 빈도를 7일 기준으로 환산한 값이에요.
        </Text>

        <View style={[styles.chartContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>감정 분포</Text>
          {stats.totalDreams === 0 && <Text style={{ color: colors.textSecondary, lineHeight: 23 }}>이 기간에는 아직 기록이 없어요. 꿈을 남기면 감정의 흐름이 나타나요.</Text>}
          {Object.entries(stats.emotionStats).map(([emotion, count]) => {
            const total = Object.values(stats.emotionStats).reduce((s, c) => s + c, 0);
            const percentage = (count / total) * 100;
            return (
              <View key={emotion} style={styles.emotionRow}>
                <View style={styles.emotionInfo}>
                  <View style={styles.emotionIcon}><EmotionIcon emotion={emotion} size={20} /></View>
                  <Text style={[styles.emotionLabel, { color: colors.text }]}>{getEmotionLabel(emotion)}</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${percentage}%`, backgroundColor: getEmotionColor(emotion) },
                      ]}
                    />
                  </View>
                  <Text style={[styles.percentage, { color: colors.textSecondary }]}>
                    {count}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={[styles.chartContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>자주 나타나는 키워드·상징</Text>
          {stats.mostCommonThemes.length === 0 && <Text style={{ color: colors.textSecondary, lineHeight: 23 }}>꿈에 등장한 단어와 상징을 이곳에 모아드려요.</Text>}
          {stats.mostCommonThemes.map((theme, index) => (
            <View key={theme.theme}>
            <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: expandedTheme === theme.theme }}
              onPress={() => setExpandedTheme(value => value === theme.theme ? null : theme.theme)}
              style={[styles.themeRow, { minHeight: 44 }]}>
              <View style={[styles.rankBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <Text style={[styles.themeText, { color: colors.text }]}>{theme.theme}</Text>
              <Text style={[styles.themeCount, { color: colors.textSecondary }]}>{theme.ids.length}편</Text>
              <Ionicons name={expandedTheme === theme.theme ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            {expandedTheme === theme.theme && theme.ids.map(id => {
              const dream = byId.get(id);
              return dream ? <TouchableOpacity key={id} accessibilityRole="button" onPress={() => setOpenedDreamId(id)}
                style={{ minHeight: 44, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.border }}>
                <Text style={{ color: colors.textSecondary }}>{dream.date}</Text>
                <Text numberOfLines={2} style={{ color: colors.text }}>{dream.content}</Text>
              </TouchableOpacity> : null;
            })}
            </View>
          ))}
        </View>

        <View style={[styles.insightCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>인사이트</Text>
          <Text style={[styles.insightText, { color: colors.textSecondary }]}>
            {stats.totalDreams === 0 ? '떠오르는 장면 하나부터 가볍게 남겨보세요. 잠시 쉬어가도 괜찮아요.' : stats.nightmareCount > stats.totalDreams * 0.3
              ? `이 기간에 악몽으로 분류한 꿈이 ${stats.nightmareCount}편 있어요.`
              : stats.lucidCount > 0
              ? `자각몽을 ${stats.lucidCount}회 기록했어요. 그때의 장면과 느낌을 다시 살펴보세요.`
              : streak && streak.currentStreak >= 3
              ? `${streak.currentStreak}일 연속 기록 중이에요. 이 리듬을 유지해보세요!`
              : '매일 짧게라도 기록하면 감정 패턴이 선명해집니다.'}
          </Text>
        </View>

        <View style={{ marginVertical: 12 }}>
          <AdMobBanner adSize="MEDIUM_RECTANGLE" />
        </View>
      </ScrollView>
      {openedDreamId ? <DreamDetailModal dream={dreams.find(d => d.id === openedDreamId) ?? null}
        visible onClose={() => setOpenedDreamId(null)} onChanged={load} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  headerSubtitle: { fontSize: 14 },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
  },
  periodButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  content: { flex: 1, paddingHorizontal: 20 },
  streakCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 22,
    paddingVertical: 16,
    marginBottom: 14,
  },
  streakItem: { flex: 1, alignItems: 'center', gap: 4 },
  streakValue: { fontSize: 22, fontWeight: '800' },
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 11, textAlign: 'center' },
  chartContainer: { padding: 20, borderRadius: 22, borderWidth: 1, marginBottom: 20 },
  chartTitle: { fontSize: 18, fontWeight: '700', marginBottom: 18 },
  emotionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  emotionInfo: { flexDirection: 'row', alignItems: 'center', width: 88 },
  emotionIcon: { marginRight: 6 },
  emotionLabel: { fontSize: 13, fontWeight: '600' },
  progressContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  progressBar: { flex: 1, height: 8, borderRadius: 4, marginRight: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  percentage: { fontSize: 12, minWidth: 24, textAlign: 'right' },
  themeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  themeText: { flex: 1, fontSize: 15, fontWeight: '500' },
  themeCount: { fontSize: 13 },
  insightCard: { padding: 20, borderRadius: 22, borderWidth: 1, marginBottom: 8 },
  insightText: { fontSize: 14, lineHeight: 22 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
