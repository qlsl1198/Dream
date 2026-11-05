import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { AccessibilityInfo, AppState, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createDialoguePlayer } from '../utils/dialoguePlayer';

export interface MongiDialogueHandle { reveal: () => boolean }

const MongiDialogue = forwardRef<MongiDialogueHandle, {
  title: string; text: string; active: boolean; onTypingChange: (typing: boolean) => void;
}>(function MongiDialogue({ title, text, active, onTypingChange }, ref) {
  const [visible, setVisible] = useState('');
  const [preferences, setPreferences] = useState({ ready: false, reduced: true, screenReader: true });
  const [finished, setFinished] = useState(false);
  const player = useMemo(() => createDialoguePlayer(text, setVisible, () => {
    setFinished(true); onTypingChange(false);
  }), [text, onTypingChange]);
  useImperativeHandle(ref, () => ({ reveal: player.reveal }), [player]);

  useEffect(() => {
    let live = true;
    // Subscribe before querying; events win over a late initial query.
    let reducedChanged = false;
    let readerChanged = false;
    const reduced = AccessibilityInfo.addEventListener('reduceMotionChanged', value => {
      reducedChanged = true; setPreferences(p => ({ ...p, reduced: value }));
    });
    const reader = AccessibilityInfo.addEventListener('screenReaderChanged', value => {
      readerChanged = true; setPreferences(p => ({ ...p, screenReader: value }));
    });
    // RN Web reports screen-reader=true unconditionally. Web readers receive the
    // complete aria label regardless of the decorative typing layer instead.
    Promise.all([AccessibilityInfo.isReduceMotionEnabled(), Platform.OS === 'web' ? Promise.resolve(false) : AccessibilityInfo.isScreenReaderEnabled()])
      .then(([motion, screenReader]) => { if (live) setPreferences(p => ({ ready: true,
        reduced: reducedChanged ? p.reduced : motion, screenReader: readerChanged ? p.screenReader : screenReader })); })
      .catch(() => { if (live) setPreferences({ ready: true, reduced: true, screenReader: true }); });
    return () => { live = false; reduced.remove(); reader.remove(); };
  }, []);
  useEffect(() => {
    if (!active || preferences.reduced && preferences.ready || preferences.screenReader && preferences.ready) player.reveal();
    else if (preferences.ready) player.start();
    return player.stop;
  }, [player, active, preferences]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => { if (state !== 'active') player.reveal(); });
    return () => { subscription.remove(); player.stop(); };
  }, [player]);

  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${title} ${text}`}
    accessibilityHint={finished ? '아래 버튼으로 다음 이야기를 볼 수 있어요.' : '두 번 탭하면 문장이 바로 완성돼요.'}
    activeOpacity={0.95} onPress={player.reveal} style={styles.bubble}>
    <View style={styles.tail} />
    <Text style={styles.speaker} accessible={false}>MONGI · 몽이</Text>
    <Text style={styles.title} accessible={false}>{title}</Text>
    <View style={styles.lines} accessible={false} importantForAccessibility="no-hide-descendants">
      <Text style={[styles.speech, styles.reserve]} accessible={false}>{text}</Text>
      <Text style={[styles.speech, styles.typed]} accessible={false} testID="mongi-dialogue-text">{visible}</Text>
    </View>
    <Text style={styles.hint} accessible={false}>{finished ? '이야기를 계속해볼까?  ▾' : '톡 누르면 바로 읽을 수 있어요  ···'}</Text>
  </TouchableOpacity>;
});
export default MongiDialogue;

const styles = StyleSheet.create({
  bubble: { width: '100%', borderRadius: 26, borderWidth: 2, borderColor: '#E8D5A3', backgroundColor: '#F7F3EA', padding: 22, marginTop: 16 },
  tail: { position: 'absolute', top: -10, alignSelf: 'center', width: 18, height: 18, backgroundColor: '#F7F3EA', borderLeftWidth: 2, borderTopWidth: 2, borderColor: '#E8D5A3', transform: [{ rotate: '45deg' }] },
  speaker: { color: '#74613A', fontWeight: '800', fontSize: 11, letterSpacing: 2, marginBottom: 10 },
  title: { color: '#25314B', fontSize: 22, lineHeight: 31, fontWeight: '800', marginBottom: 12 },
  lines: { position: 'relative' }, speech: { color: '#46516A', fontSize: 16, lineHeight: 26 },
  reserve: { opacity: 0 }, typed: { ...StyleSheet.absoluteFillObject },
  hint: { fontSize: 12, lineHeight: 19, color: '#74613A', marginTop: 16, textAlign: 'right' },
});
