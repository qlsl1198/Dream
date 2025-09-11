import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { DreamStorage, DreamRecord } from '../services/DreamStorage';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [dreams, setDreams] = useState<DreamRecord[]>([]);

  useEffect(() => {
    loadDreams();
  }, []);

  const loadDreams = async () => {
    try {
      const savedDreams = await DreamStorage.getDreams();
      setDreams(savedDreams);
    } catch (error) {
      console.error('꿈 기록 불러오기 오류:', error);
    }
  };

  const getEmotionEmoji = (emotion: string) => {
    const emotionMap: { [key: string]: string } = {
      joy: '😊',
      sadness: '😢',
      fear: '😨',
      anger: '😠',
      surprise: '😲',
      neutral: '😌',
    };
    return emotionMap[emotion] || '😌';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const handleDeleteDream = (id: string) => {
    Alert.alert(
      '꿈 기록 삭제',
      '이 꿈 기록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await DreamStorage.deleteDream(id);
              await loadDreams(); // 목록 새로고침
            } catch (error) {
              console.error('꿈 삭제 오류:', error);
              Alert.alert('오류', '꿈을 삭제하는 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const renderDreamItem = ({ item }: { item: DreamRecord }) => (
    <TouchableOpacity style={[styles.dreamItem, { 
      backgroundColor: colors.surface,
      borderColor: colors.border 
    }]}>
      <View style={styles.dreamHeader}>
        <View style={styles.dreamInfo}>
          <Text style={[styles.dreamDate, { color: colors.text }]}>{formatDate(item.date)}</Text>
          <Text style={styles.dreamEmotion}>{getEmotionEmoji(item.emotion)}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteDream(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.dreamContent, { color: colors.text }]} numberOfLines={3}>
        {item.content}
      </Text>
      
      <View style={styles.dreamFooter}>
        <View style={styles.confidenceContainer}>
          <Ionicons name="analytics-outline" size={14} color={colors.primary} />
          <Text style={[styles.confidenceText, { color: colors.textSecondary }]}>
            {Math.round(item.confidence * 100)}% 신뢰도
          </Text>
        </View>
        <View style={styles.interpretationBadge}>
          <Ionicons name="checkmark-circle" size={14} color={colors.success} />
          <Text style={[styles.interpretationText, { color: colors.success }]}>해석 완료</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="moon-outline" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>아직 꿈 기록이 없습니다</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        첫 번째 꿈을 기록하고 해석해보세요
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>꿈 기록</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          총 {dreams.length}개의 꿈을 기록했습니다
        </Text>
      </View>

      <FlatList
        data={dreams}
        renderItem={renderDreamItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          dreams.length === 0 && styles.emptyListContainer,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  dreamItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dreamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dreamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dreamDate: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  dreamEmotion: {
    fontSize: 16,
  },
  deleteButton: {
    padding: 4,
  },
  dreamContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  dreamFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  interpretationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interpretationText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
