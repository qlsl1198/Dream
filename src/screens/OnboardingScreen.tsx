import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingService } from '../services/OnboardingService';
import MongiSprite from '../components/MongiSprite';
import MongiDialogue, { MongiDialogueHandle } from '../components/MongiDialogue';
import { MONGI_TUTORIAL } from '../data/mongiTutorial';
import LegalScreen from './LegalScreen';

export default function OnboardingScreen({ onDone, replay = false }: { onDone: () => void; replay?: boolean }) {
  const [index, setIndex] = useState(0);
  const [legalOpen, setLegalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [typing, setTyping] = useState(true);
  const dialogue = useRef<MongiDialogueHandle>(null);
  const finishing = useRef(false);
  const scroll = useRef<ScrollView>(null);
  const step = MONGI_TUTORIAL[index];
  const last = index === MONGI_TUTORIAL.length - 1;
  const move = (next: number) => {
    setTyping(true);
    setIndex(Math.max(0, Math.min(MONGI_TUTORIAL.length - 1, next)));
    scroll.current?.scrollTo({ y: 0, animated: false });
  };
  const finish = async () => {
    if (finishing.current) return;
    finishing.current = true;
    setSaving(true);
    try {
      if (!replay) await OnboardingService.completeOnboarding();
      onDone();
    } catch { Alert.alert('저장 실패', '안내 완료 상태를 저장하지 못했어요. 다시 시도해주세요.'); }
    finally { finishing.current = false; setSaving(false); }
  };
  return <SafeAreaView style={styles.safe}>
    <LinearGradient colors={['#10182D', '#26314C', '#39445E']} style={styles.fill}>
      <View style={styles.top}>
        <Text style={styles.eyebrow}>몽이의 작은 안내서</Text>
        <TouchableOpacity accessibilityRole="button" disabled={saving} onPress={finish} style={styles.touch}>
          <Text style={styles.muted}>{replay ? '닫기' : '건너뛰기'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView ref={scroll} contentContainerStyle={styles.content}>
        <View style={styles.page}>
          <View style={styles.moon}><MongiSprite mood={step.mood} /></View>
          <MongiDialogue key={step.id} ref={dialogue} title={step.title} text={step.speech} active={!legalOpen} onTypingChange={setTyping} />
          <View style={styles.tip}>
            <Ionicons name={step.icon} size={23} color="#E8D5A3" accessible={false} />
            <View style={styles.tipCopy}>
              <Text style={styles.tipTitle}>{step.label}</Text>
              <Text style={styles.detail}>{step.detail}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
          <View style={styles.progress} accessibilityLabel={`${MONGI_TUTORIAL.length}단계 중 ${index + 1}단계`}>
            {MONGI_TUTORIAL.map((item, i) => <View key={item.id} style={[styles.dot, i === index && styles.active]} />)}
          </View>
          <Text style={styles.counter}>{index + 1} / {MONGI_TUTORIAL.length}</Text>
          <View style={styles.actions}>
            {index > 0 ? <TouchableOpacity accessibilityRole="button" disabled={saving} style={styles.back} onPress={() => move(index - 1)}><Text style={styles.backText}>이전</Text></TouchableOpacity> : null}
            <TouchableOpacity accessibilityRole="button" disabled={saving} style={styles.cta} onPress={() => {
              if (dialogue.current?.reveal()) return;
              if (last) finish(); else move(index + 1);
            }}>
              <Text style={styles.ctaText}>{saving ? '준비 중…' : typing ? '바로 읽기' : last ? (replay ? '안내 마치기' : '몽이와 시작하기') : '다음 이야기'}</Text>
              <Ionicons name={last ? 'sparkles' : 'arrow-forward'} size={18} color="#172138" accessible={false} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity accessibilityRole="link" onPress={() => setLegalOpen(true)} style={styles.legal}><Text style={styles.muted}>개인정보 처리방침 읽기</Text></TouchableOpacity>
      </View>
      <Modal visible={legalOpen} animationType="slide" onRequestClose={() => setLegalOpen(false)}><LegalScreen type="privacy" onClose={() => setLegalOpen(false)} /></Modal>
    </LinearGradient>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#10182D' }, fill: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, flexWrap: 'wrap' },
  eyebrow: { color: '#E8D5A3', fontSize: 13, fontWeight: '600' }, touch: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 8 },
  muted: { color: '#D2D8E3', fontSize: 13 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  page: { width: '100%', maxWidth: 520, alignSelf: 'center', alignItems: 'center' },
  footer: { width: '100%', maxWidth: 568, alignSelf: 'center', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 8 },
  moon: { width: 180, borderRadius: 90, backgroundColor: 'rgba(232,213,163,0.08)', paddingVertical: 12 },
  tip: { flexDirection: 'row', gap: 12, paddingVertical: 22, alignItems: 'flex-start', width: '100%' },
  tipCopy: { flex: 1 }, tipTitle: { color: '#F7F3EA', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  detail: { color: '#CDD4E1', fontSize: 13, lineHeight: 21 },
  progress: { flexDirection: 'row', gap: 6, marginTop: 6 }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#66718A' }, active: { width: 24, backgroundColor: '#E8D5A3' },
  counter: { color: '#CDD4E1', fontSize: 12, marginTop: 8, marginBottom: 20 },
  actions: { flexDirection: 'row', gap: 12, width: '100%' },
  back: { minHeight: 52, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 16, borderWidth: 1, borderColor: '#778198' }, backText: { color: '#F7F3EA', fontSize: 15 },
  cta: { flex: 1, minHeight: 52, padding: 16, borderRadius: 16, backgroundColor: '#E8D5A3', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' },
  ctaText: { color: '#172138', fontWeight: '800', fontSize: 16 }, legal: { minHeight: 48, justifyContent: 'center', marginTop: 8 },
});
