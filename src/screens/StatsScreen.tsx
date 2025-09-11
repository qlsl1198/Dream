import React, { useState, useEffect } from 'react';
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
import AdMobBanner from '../components/AdMobBanner';
import { useTheme } from '../contexts/ThemeContext';
import { DreamStorage, DreamRecord } from '../services/DreamStorage';

const { width } = Dimensions.get('window');

interface DreamStats {
  totalDreams: number;
  emotionStats: { [key: string]: number };
  monthlyStats: { [key: string]: number };
  averageConfidence: number;
  mostCommonThemes: { theme: string; count: number }[];
  dreamFrequency: number; // 꿈을 꾸는 빈도 (주당)
}

export default function StatsScreen() {
  const { colors } = useTheme();
  const [dreams, setDreams] = useState<DreamRecord[]>([]);
  const [stats, setStats] = useState<DreamStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadDreams();
  }, []);

  useEffect(() => {
    if (dreams.length > 0) {
      calculateStats();
    }
  }, [dreams, selectedPeriod]);

  const loadDreams = async () => {
    try {
      const savedDreams = await DreamStorage.getDreams();
      setDreams(savedDreams);
    } catch (error) {
      console.error('꿈 기록 불러오기 오류:', error);
    }
  };

  const calculateStats = () => {
    const now = new Date();
    let filteredDreams = dreams;

    // 기간별 필터링
    if (selectedPeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredDreams = dreams.filter(dream => new Date(dream.date) >= weekAgo);
    } else if (selectedPeriod === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredDreams = dreams.filter(dream => new Date(dream.date) >= monthAgo);
    }

    // 감정별 통계
    const emotionStats: { [key: string]: number } = {};
    filteredDreams.forEach(dream => {
      emotionStats[dream.emotion] = (emotionStats[dream.emotion] || 0) + 1;
    });

    // 월별 통계
    const monthlyStats: { [key: string]: number } = {};
    filteredDreams.forEach(dream => {
      const month = dream.date.substring(0, 7); // YYYY-MM
      monthlyStats[month] = (monthlyStats[month] || 0) + 1;
    });

    // 평균 신뢰도
    const averageConfidence = filteredDreams.length > 0 
      ? filteredDreams.reduce((sum, dream) => sum + dream.confidence, 0) / filteredDreams.length
      : 0;

    // 자주 나타나는 테마 (간단한 키워드 분석)
    const themeCounts: { [key: string]: number } = {};
    filteredDreams.forEach(dream => {
      const words = dream.content.split(' ');
      words.forEach(word => {
        if (word.length > 2) {
          themeCounts[word] = (themeCounts[word] || 0) + 1;
        }
      });
    });

    const mostCommonThemes = Object.entries(themeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([theme, count]) => ({ theme, count }));

    // 꿈 빈도 계산
    const daysDiff = Math.max(1, (now.getTime() - new Date(filteredDreams[0]?.date || now).getTime()) / (1000 * 60 * 60 * 24));
    const dreamFrequency = filteredDreams.length / (daysDiff / 7);

    setStats({
      totalDreams: filteredDreams.length,
      emotionStats,
      monthlyStats,
      averageConfidence,
      mostCommonThemes,
      dreamFrequency,
    });
  };

  const getEmotionEmoji = (emotion: string) => {
    const emotionMap: { [key: string]: string } = {
      joy: '😊',
      sadness: '😢',
      fear: '😨',
      anger: '😠',
      surprise: '😲',
      disgust: '🤢',
      neutral: '😐',
    };
    return emotionMap[emotion] || '😐';
  };

  const getEmotionColor = (emotion: string) => {
    const emotionColors: { [key: string]: string } = {
      joy: '#10b981',
      sadness: '#3b82f6',
      fear: '#ef4444',
      anger: '#f59e0b',
      surprise: '#8b5cf6',
      disgust: '#6b7280',
      neutral: '#9ca3af',
    };
    return emotionColors[emotion] || colors.primary;
  };

  const renderPeriodSelector = () => (
    <View style={[styles.periodSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {(['week', 'month', 'year'] as const).map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && { backgroundColor: colors.primary }
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text style={[
            styles.periodButtonText,
            { color: selectedPeriod === period ? '#fff' : colors.text }
          ]}>
            {period === 'week' ? '1주' : period === 'month' ? '1개월' : '1년'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStatCard = (title: string, value: string | number, icon: string, color: string = colors.primary) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={[styles.statTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    </View>
  );

  const renderEmotionChart = () => {
    if (!stats || Object.keys(stats.emotionStats).length === 0) return null;

    const total = Object.values(stats.emotionStats).reduce((sum, count) => sum + count, 0);

    return (
      <View style={[styles.chartContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>감정별 분포</Text>
        {Object.entries(stats.emotionStats).map(([emotion, count]) => {
          const percentage = (count / total) * 100;
          return (
            <View key={emotion} style={styles.emotionRow}>
              <View style={styles.emotionInfo}>
                <Text style={styles.emotionEmoji}>{getEmotionEmoji(emotion)}</Text>
                <Text style={[styles.emotionLabel, { color: colors.text }]}>{emotion}</Text>
              </View>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${percentage}%`, 
                        backgroundColor: getEmotionColor(emotion) 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.percentage, { color: colors.textSecondary }]}>
                  {count} ({percentage.toFixed(1)}%)
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderThemeList = () => {
    if (!stats || stats.mostCommonThemes.length === 0) return null;

    return (
      <View style={[styles.chartContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>자주 나타나는 키워드</Text>
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
    );
  };

  if (!stats) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>꿈 분석 통계</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            꿈 기록을 분석해보세요
          </Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="analytics-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>아직 꿈 기록이 없어요</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            꿈을 기록하고 해석하면{'\n'}상세한 통계를 볼 수 있습니다
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>꿈 분석 통계</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {selectedPeriod === 'week' ? '최근 1주일' : 
           selectedPeriod === 'month' ? '최근 1개월' : '최근 1년'} 통계
        </Text>
      </View>

      {renderPeriodSelector()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          {renderStatCard('총 꿈 기록', stats.totalDreams, 'moon-outline')}
          {renderStatCard('평균 신뢰도', `${(stats.averageConfidence * 100).toFixed(1)}%`, 'checkmark-circle-outline', colors.success)}
          {renderStatCard('주간 꿈 빈도', `${stats.dreamFrequency.toFixed(1)}개`, 'calendar-outline', colors.warning)}
        </View>

        {renderEmotionChart()}
        {renderThemeList()}

        <View style={styles.insightsContainer}>
          <Text style={[styles.insightsTitle, { color: colors.text }]}>💡 인사이트</Text>
          <View style={[styles.insightCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.insightText, { color: colors.text }]}>
              {stats.totalDreams === 0 
                ? '꿈을 기록하기 시작해보세요!'
                : stats.averageConfidence > 0.8
                ? '높은 신뢰도로 꿈을 해석하고 있어요!'
                : stats.dreamFrequency > 3
                ? '활발한 꿈 활동을 보이고 있어요!'
                : '꿈 기록을 더 자주 해보세요!'
              }
            </Text>
          </View>
        </View>
      </ScrollView>
      {/* 권장: 통계 화면 하단에 미디엄 직사각형(300x250) 배치 */}
      <View style={{ paddingHorizontal: 20, marginTop: 8, marginBottom: 16 }}>
        <AdMobBanner adSize="MEDIUM_RECTANGLE" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (width - 60) / 3,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  chartContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emotionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  emotionEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  emotionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    minWidth: 50,
    textAlign: 'right',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  themeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  themeCount: {
    fontSize: 14,
  },
  insightsContainer: {
    marginBottom: 20,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  insightCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
