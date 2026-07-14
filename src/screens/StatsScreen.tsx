import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AdMobBanner from '../components/AdMobBanner';
import { useTheme } from '../contexts/ThemeContext';
import { DreamStorage, DreamRecord } from '../services/DreamStorage';
import { StreakService, StreakInfo } from '../services/StreakService';
import { getEmotionColor, getEmotionEmoji, getEmotionLabel, extractKeywords } from '../utils/dreamHelpers';

const { width } = Dimensions.get('window');

interface DreamStats {
  totalDreams: number;
  emotionStats: { [key: string]: number };
  averageConfidence: number;
  mostCommonThemes: { theme: string; count: number }[];
  dreamFrequency: number;
  lucidCount: number;
  nightmareCount: number;
}

export default function StatsScreen() {
  const { colors } = useTheme();
  const [dreams, setDreams] = useState<DreamRecord[]>([]);
  const [stats, setStats] = useState<DreamStats | null>(null);
  const [streak, setStreak] = useState<StreakInfo | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const load = useCallback(async () => {
    const savedDreams = await DreamStorage.getDreams();
    setDreams(savedDreams);
    setStreak(await StreakService.getStreakInfo());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  React.useEffect(() => {
    if (dreams.length === 0) {
      setStats(null);
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

    const averageConfidence =
      filtered.length > 0
        ? filtered.reduce((sum, dream) => sum + dream.confidence, 0) / filtered.length
        : 0;

    const keywordCounts: Record<string, number> = {};
    filtered.forEach((dream) => {
      extractKeywords(dream.content, 12).forEach((word) => {
        keywordCounts[word] = (keywordCounts[word] || 0) + 1;
      });
      (dream.matchedSymbols || []).forEach((s) => {
        keywordCounts[s] = (keywordCounts[s] || 0) + 2;
      });
    });

    const mostCommonThemes = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([theme, count]) => ({ theme, count }));

    const daysDiff = Math.max(
      1,
      (now.getTime() - new Date(filtered[filtered.length - 1]?.date || now).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    setStats({
      totalDreams: filtered.length,
      emotionStats,
      averageConfidence,
      mostCommonThemes,
      dreamFrequency: filtered.length / (daysDiff / 7),
      lucidCount: filtered.filter((d) => d.dreamType === 'lucid').length,
      nightmareCount: filtered.filter((d) => d.dreamType === 'nightmare').length,
    });
  }, [dreams, selectedPeriod]);

  if (!stats) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>꿈 분석</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            패턴을 발견해보세요
          </Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="analytics-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>아직 꿈 기록이 없어요</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            꿈을 기록하면 감정·상징·연속 기록 통계가 나타납니다
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>꿈 분석</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {selectedPeriod === 'week' ? '최근 1주일' : selectedPeriod === 'month' ? '최근 1개월' : '전체 기간'}
        </Text>
      </View>

      <View style={[styles.periodSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {(['week', 'month', 'year'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[styles.periodButton, selectedPeriod === period && { backgroundColor: colors.primary }]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={{ color: selectedPeriod === period ? '#fff' : colors.text, fontWeight: '600', fontSize: 13 }}>
              {period === 'week' ? '1주' : period === 'month' ? '1개월' : '전체'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {streak && (
          <View style={[styles.streakCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.streakItem}>
              <Ionicons name="flame" size={22} color={colors.warning} />
              <Text style={[styles.streakValue, { color: colors.text }]}>{streak.currentStreak}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>연속 기록</Text>
            </View>
            <View style={styles.streakItem}>
              <Ionicons name="trophy-outline" size={22} color={colors.accent} />
              <Text style={[styles.streakValue, { color: colors.text }]}>{streak.longestStreak}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>최장 기록</Text>
            </View>
            <View style={styles.streakItem}>
              <Ionicons name="moon-outline" size={22} color={colors.primary} />
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
              {(stats.averageConfidence * 100).toFixed(0)}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>평균 신뢰도</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.dreamFrequency.toFixed(1)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>주간 빈도</Text>
          </View>
        </View>

        <View style={[styles.chartContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>감정 분포</Text>
          {Object.entries(stats.emotionStats).map(([emotion, count]) => {
            const total = Object.values(stats.emotionStats).reduce((s, c) => s + c, 0);
            const percentage = (count / total) * 100;
            return (
              <View key={emotion} style={styles.emotionRow}>
                <View style={styles.emotionInfo}>
                  <Text style={styles.emotionEmoji}>{getEmotionEmoji(emotion)}</Text>
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
          {stats.mostCommonThemes.map((theme, index) => (
            <View key={theme.theme} style={styles.themeRow}>
              <View style={[styles.rankBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <Text style={[styles.themeText, { color: colors.text }]}>{theme.theme}</Text>
              <Text style={[styles.themeCount, { color: colors.textSecondary }]}>{theme.count}회</Text>
            </View>
          ))}
        </View>

        <View style={[styles.insightCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>인사이트</Text>
          <Text style={[styles.insightText, { color: colors.textSecondary }]}>
            {stats.nightmareCount > stats.totalDreams * 0.3
              ? '악몽 비중이 높아요. 수면 환경과 스트레스를 함께 점검해보세요.'
              : stats.lucidCount > 0
              ? `자각몽 ${stats.lucidCount}회 기록! 의도적 자각 연습이 효과가 있는 것 같아요.`
              : streak && streak.currentStreak >= 3
              ? `${streak.currentStreak}일 연속 기록 중이에요. 이 리듬을 유지해보세요!`
              : '매일 짧게라도 기록하면 감정 패턴이 선명해집니다.'}
          </Text>
        </View>

        <View style={{ marginVertical: 12 }}>
          <AdMobBanner adSize="MEDIUM_RECTANGLE" />
        </View>
      </ScrollView>
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
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
  },
  periodButton: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  content: { flex: 1, paddingHorizontal: 20 },
  streakCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 14,
  },
  streakItem: { flex: 1, alignItems: 'center', gap: 4 },
  streakValue: { fontSize: 22, fontWeight: '800' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  statCard: {
    width: (width - 60) / 3,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 11, textAlign: 'center' },
  chartContainer: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 14 },
  chartTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  emotionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  emotionInfo: { flexDirection: 'row', alignItems: 'center', width: 88 },
  emotionEmoji: { fontSize: 18, marginRight: 6 },
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
  insightCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  insightText: { fontSize: 14, lineHeight: 22 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
