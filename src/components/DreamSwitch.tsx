import React from 'react';
import { Platform, Switch, SwitchProps } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function DreamSwitch(props: SwitchProps) {
  const { colors } = useTheme();
  // React Native Web uses a separate active thumb prop; native iOS does not.
  const webAppearance = Platform.OS === 'web' ? { activeThumbColor: '#F7F1E5' } : {};
  return <Switch {...props} {...webAppearance}
    trackColor={{ false: colors.border, true: colors.accent }} thumbColor="#F7F1E5" />;
}
