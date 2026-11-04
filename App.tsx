import React, { useEffect, useState } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';


import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { OnboardingService } from './src/services/OnboardingService';

import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SymbolDictionaryScreen from './src/screens/SymbolDictionaryScreen';
import StatsScreen from './src/screens/StatsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AppErrorBoundary from './src/components/AppErrorBoundary';

const Tab = createBottomTabNavigator();

function MainApp() {
  const { theme, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBottom = Math.max(insets.bottom, 8);

  const navTheme = {
    ...(theme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.accent,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
              Home: 'moon-outline',
              History: 'journal-outline',
              Symbols: 'book-outline',
              Stats: 'analytics-outline',
              Settings: 'settings-outline',
            };
            return <Ionicons name={icons[route.name] || 'help-outline'} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelPosition: 'below-icon',
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingBottom: tabBottom,
            paddingTop: 8,
            height: 68 + tabBottom,
          },
          tabBarLabelStyle: { fontSize: 11, lineHeight: 16, fontWeight: '600', marginTop: 2 },
          tabBarItemStyle: { borderRadius: 16, marginHorizontal: 3 },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '해석' }} />
        <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: '기록' }} />
        <Tab.Screen name="Symbols" component={SymbolDictionaryScreen} options={{ tabBarLabel: '사전' }} />
        <Tab.Screen name="Stats" component={StatsScreen} options={{ tabBarLabel: '통계' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: '설정' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function AppContent() {
  const [phase, setPhase] = useState<'loading' | 'splash' | 'onboarding' | 'main'>('loading');

  useEffect(() => {
    (async () => {
      try {
        const done = await OnboardingService.hasCompletedOnboarding();
        setPhase(done ? 'main' : 'onboarding');
      } catch { setPhase('onboarding'); }
    })();
  }, []);

  if (phase === 'loading') return null;
  if (phase === 'onboarding') {
    return <OnboardingScreen onDone={() => setPhase('main')} />;
  }
  if (phase === 'splash') {
    return <SplashScreen onStart={() => setPhase('main')} />;
  }
  return <MainApp />;
}

export default function App() {
  return <SafeAreaProvider><AppErrorBoundary><ThemeProvider><AppContent /></ThemeProvider></AppErrorBoundary></SafeAreaProvider>;
}
