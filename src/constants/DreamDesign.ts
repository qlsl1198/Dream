import { StyleSheet } from 'react-native';

export const DreamDesign = {
  gutter: 24, radius: 22, controlRadius: 16, maxWidth: 760,
};

export const dreamLayout = StyleSheet.create({
  column: { width: '100%', maxWidth: DreamDesign.maxWidth, alignSelf: 'center' },
  body: { width: '100%', maxWidth: DreamDesign.maxWidth, alignSelf: 'center', padding: 24, paddingBottom: 40 },
  title: { fontSize: 28, lineHeight: 36, fontWeight: '700', letterSpacing: -0.7 },
  section: { fontSize: 18, lineHeight: 26, fontWeight: '700', marginTop: 24, marginBottom: 12 },
});
