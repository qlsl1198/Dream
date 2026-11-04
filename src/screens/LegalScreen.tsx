import React from 'react';
import { SafeAreaView, ScrollView, Text, StyleSheet, TouchableOpacity, View, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { APP_CONFIG } from '../constants/AppConfig';

interface Props {
  type: 'privacy' | 'terms';
  onClose: () => void;
}

import { PRIVACY_TEXT, TERMS_TEXT } from '../constants/LegalContent';

export default function LegalScreen({ type, onClose }: Props) {
  const { colors } = useTheme();
  const title = type === 'privacy' ? '개인정보 처리방침' : '이용약관';
  const body = type === 'privacy' ? PRIVACY_TEXT : TERMS_TEXT;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[styles.text, { color: colors.text }]}>{body.trim()}</Text>
        <TouchableOpacity
          style={[styles.linkBtn, { backgroundColor: colors.primary }]}
          onPress={() => Linking.openURL(`mailto:${APP_CONFIG.supportEmail}`)}
        >
          <Text style={styles.linkText}>문의하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 17, fontWeight: '700' },
  body: { padding: 20, paddingBottom: 40 },
  text: { fontSize: 14, lineHeight: 22 },
  linkBtn: {
    marginTop: 24,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  linkText: { color: '#fff', fontWeight: '700' },
});
