import React from 'react';
import { SafeAreaView, Text, TouchableOpacity } from 'react-native';

export default class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0B1426', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
        <Text style={{ color: '#F2F5F9', fontSize: 22, fontWeight: '700' }}>화면을 불러오지 못했어요</Text>
        <Text style={{ color: '#9AA8B8', marginVertical: 20, textAlign: 'center' }}>저장된 기록은 삭제되지 않았습니다. 잠시 후 다시 열어주세요.</Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => this.setState({ failed: false })} style={{ backgroundColor: '#E8D5A3', borderRadius: 12, padding: 16 }}>
          <Text style={{ color: '#0B1426', fontWeight: '700' }}>다시 열기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
}
