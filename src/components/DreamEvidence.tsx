import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { matchSymbolEvidence } from '../data/dreamSymbols';

export default memo(function DreamEvidence({ content }: { content: string }) {
  const { colors } = useTheme();
  const evidence = matchSymbolEvidence(content);
  return (
    <View style={[styles.panel, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.accent }]}>본문에서 찾은 단서</Text>
      <Text style={[styles.help, { color: colors.textSecondary }]}>
        {evidence.length
          ? '꿈에 직접 적은 표현이에요. 아래 해석은 이 단서와 별개로 읽을 수 있는 참고 관점이에요.'
          : '본문에서 도감 상징을 확인하지 못했어요. 아래 해석은 상징을 단정하지 않는 참고로 읽어주세요.'}
      </Text>
      {evidence.map(({ symbol, keyword, excerpt }) => (
        <View key={symbol.id} style={[styles.row, { borderColor: colors.border }]}>
          <Text style={[styles.keyword, { color: colors.text }]}>{symbol.name} · {keyword}</Text>
          <Text style={[styles.quote, { color: colors.textSecondary }]}>“{excerpt.trim()}”</Text>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  panel: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12, gap: 6 },
  title: { fontSize: 16, lineHeight: 24, fontWeight: '700' },
  help: { fontSize: 13, lineHeight: 20 },
  row: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 4, paddingTop: 8, gap: 3 },
  keyword: { fontSize: 14, fontWeight: '700' },
  quote: { fontSize: 14, lineHeight: 22 },
});
