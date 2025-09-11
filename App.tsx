import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import mobileAds from 'react-native-google-mobile-ads';

// Contexts
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import MemoryScreen from './src/screens/MemoryScreen';
import StatsScreen from './src/screens/StatsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function MainApp() {
  const { theme, colors } = useTheme();
  
  return (
    <NavigationContainer>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
                           tabBarIcon: ({ focused, color, size }) => {
                   let iconName: keyof typeof Ionicons.glyphMap;

                   if (route.name === 'Home') {
                     iconName = focused ? 'moon' : 'moon-outline';
                   } else if (route.name === 'History') {
                     iconName = focused ? 'time' : 'time-outline';
                   } else if (route.name === 'Memory') {
                     iconName = focused ? 'search' : 'search-outline';
                   } else if (route.name === 'Stats') {
                     iconName = focused ? 'analytics' : 'analytics-outline';
                   } else if (route.name === 'Settings') {
                     iconName = focused ? 'settings' : 'settings-outline';
                   } else {
                     iconName = 'help-outline';
                   }

                   return <Ionicons name={iconName} size={size} color={color} />;
                 },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ 
            title: '꿈 해석',
            tabBarLabel: '꿈 해석'
          }}
        />
        <Tab.Screen 
          name="History" 
          component={HistoryScreen} 
          options={{ 
            title: '꿈 기록',
            tabBarLabel: '꿈 기록'
          }}
        />
                       <Tab.Screen
                 name="Memory"
                 component={MemoryScreen}
                 options={{
                   title: '기억 복원',
                   tabBarLabel: '기억 복원'
                 }}
               />
               <Tab.Screen
                 name="Stats"
                 component={StatsScreen}
                 options={{
                   title: '통계',
                   tabBarLabel: '통계'
                 }}
               />
               <Tab.Screen
                 name="Settings"
                 component={SettingsScreen}
                 options={{
                   title: '설정',
                   tabBarLabel: '설정'
                 }}
               />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function AppContent() {
  const [isAppStarted, setIsAppStarted] = useState(false);

  const handleStartApp = () => {
    setIsAppStarted(true);
  };

  if (!isAppStarted) {
    return <SplashScreen onStart={handleStartApp} />;
  }

  return <MainApp />;
}

export default function App() {
  useEffect(() => {
    // AdMob 초기화
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('AdMob 초기화 완료:', adapterStatuses);
      })
      .catch(error => {
        console.error('AdMob 초기화 실패:', error);
      });
  }, []);

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}