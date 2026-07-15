import React from 'react';
import { SafeAreaView, ScrollView, Text, StyleSheet, TouchableOpacity, View, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { APP_CONFIG } from '../constants/AppConfig';

interface Props {
  type: 'privacy' | 'terms';
  onClose: () => void;
}

const PRIVACY = `
드림로그(DreamLog) 개인정보 처리방침

최종 업데이트: 2026년 7월 14일

1. 수집하는 정보
• 앱에 직접 입력한 꿈 기록, 감정, 태그, 메모 등 일기 데이터
• 설정 정보(테마, 알림 시각 등)
• 기기 내 저장을 위한 로컬 식별 정보
• 광고(AdMob) 제공을 위한 광고 식별자(ATT 동의 시)

2. 저장 및 이용
• 꿈 기록은 기본적으로 귀하의 기기에만 저장됩니다.
• AI 꿈 해석 기능을 사용할 경우, 입력한 꿈 내용이 해석을 위해 OpenAI API로 전송될 수 있습니다.
• 네트워크가 없거나 AI를 사용하지 않는 경우 오프라인 해석 엔진만 사용됩니다.

3. 제3자 제공
• OpenAI: AI 해석 요청 시 꿈 텍스트 전송
• Google AdMob: 맞춤형/비맞춤형 광고 제공
• 그 외 판매·임대 목적의 개인정보 제공은 하지 않습니다.

4. 보관 기간
• 기기 내 데이터는 앱 삭제 또는 설정에서 "모든 데이터 삭제" 시까지 보관됩니다.

5. 이용자 권리
• 기록 열람·수정·삭제, 데이터 내보내기/가져오기, 알림 끄기, 앱 삭제

6. 아동
• 본 앱은 만 13세 미만을 대상으로 하지 않습니다.

7. 문의
• ${APP_CONFIG.supportEmail}
`;

const TERMS = `
드림로그(DreamLog) 이용약관

최종 업데이트: 2026년 7월 14일

1. 서비스 설명
드림로그는 꿈 일기 작성, AI/오프라인 해몽, 상징 사전, 통계 기능을 제공합니다.

2. 면책
• 꿈 해석은 참고용 콘텐츠이며 의학적·심리학적·법적 진단이나 조언을 대체하지 않습니다.
• AI 결과는 오류가 있을 수 있으며, 절대적 사실로 받아들여서는 안 됩니다.

3. 이용자 의무
• 타인을 비방하거나 불법적인 목적의 입력을 하지 않습니다.
• API 및 광고 시스템을 악의적으로 남용하지 않습니다.

4. 지적재산
앱 UI, 상징 사전 편집 콘텐츠, 브랜딩은 운영자에게 권리가 있습니다. 이용자가 작성한 꿈 기록의 권리는 이용자에게 있습니다.

5. 광고 및 후원
앱 내 광고와 자발적 후원 기능이 포함될 수 있습니다.

6. 변경
약관은 업데이트될 수 있으며, 앱 내 고지로 효력이 발생합니다.

7. 문의
• ${APP_CONFIG.supportEmail}
`;

export default function LegalScreen({ type, onClose }: Props) {
  const { colors } = useTheme();
  const title = type === 'privacy' ? '개인정보 처리방침' : '이용약관';
  const body = type === 'privacy' ? PRIVACY : TERMS;

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
