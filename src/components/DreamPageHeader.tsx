import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { dreamLayout } from '../constants/DreamDesign';

export default function DreamPageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const { colors } = useTheme();
  return <View style={[dreamLayout.column, styles.header]}>
    <Text accessibilityRole="header" style={[dreamLayout.title, { color: colors.text }]}>{title}</Text>
    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
  </View>;
}

export function DreamEmptyState({ title, description }: { title: string; description: string }) {
  const { colors } = useTheme();
  return <View style={styles.empty}>
    <Image source={require('../../assets/dream-world/mongi.png')} resizeMode="contain" style={styles.rabbit} accessible={false} />
    <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
    <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
  </View>;
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 },
  subtitle: { fontSize: 14, lineHeight: 22, marginTop: 6 },
  empty: { alignItems: 'center', paddingHorizontal: 32, paddingVertical: 44 },
  rabbit: { width: 128, height: 132, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  description: { fontSize: 14, lineHeight: 23, textAlign: 'center', marginTop: 10 },
});
