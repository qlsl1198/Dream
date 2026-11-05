import React from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { getEmotionIconName } from '../utils/emotionVisuals';

// Decorative: the containing control/card supplies the Korean emotion label.
export default function EmotionIcon({ emotion, size = 22, color }: { emotion: string; size?: number; color?: string }) {
  const { colors } = useTheme();
  return <MaterialCommunityIcons name={getEmotionIconName(emotion)} size={size} color={color ?? colors.accent} accessible={false} />;
}
