import React, { useEffect, useState } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';

import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { OnboardingService } from './src/services/OnboardingService';

import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SymbolDictionaryScreen from './src/screens/SymbolDictionaryScreen';
import StatsScreen from './src/screens/StatsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function MainApp() {
  const { theme, colors } = useTheme();

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
          tabBarIcon: ({ focused, color, size }) => {
            const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
              Home: focused ? 'moon' : 'moon-outline',
              History: focused ? 'journal' : 'journal-outline',
              Symbols: focused ? 'book' : 'book-outline',
              Stats: focused ? 'analytics' : 'analytics-outline',
              Settings: focused ? 'settings' : 'settings-outline',
            };
            return <Ionicons name={icons[route.name] || 'help-outline'} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingBottom: Platform.OS === 'ios' ? 8 : 6,
            paddingTop: 6,
            height: Platform.OS === 'ios' ? 84 : 64,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
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
      const done = await OnboardingService.hasCompletedOnboarding();
      setPhase(done ? 'splash' : 'onboarding');
    })();
  }, []);

  if (phase === 'loading') return null;
  if (phase === 'onboarding') {
    return <OnboardingScreen onDone={() => setPhase('splash')} />;
  }
  if (phase === 'splash') {
    return <SplashScreen onStart={() => setPhase('main')} />;
  }
  return <MainApp />;
}

export default function App() {
  useEffect(() => {
    const initAds = async () => {
      try {
        await mobileAds().setRequestConfiguration({
          maxAdContentRating: MaxAdContentRating.PG,
          tagForChildDirectedTreatment: false,
          tagForUnderAgeOfConsent: false,
        });
        await mobileAds().initialize();
      } catch (error) {
        console.log('AdMob 초기화 스킵/실패:', error);
      }
    };
    initAds();
  }, []);

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
