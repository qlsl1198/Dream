import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  onAccent: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  inputBackground: string;
  inputBorder: string;
  shadow: string;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const lightColors: ThemeColors = {
  background: '#F7F4EE',
  surface: '#FFFFFF',
  primary: '#1E3A5F',
  secondary: '#3D5A80',
  accent: '#806024',
  onAccent: '#FFFFFF',
  text: '#152238',
  textSecondary: '#5B6B7C',
  border: '#D8E0EA',
  success: '#2F9E7B',
  warning: '#D97706',
  error: '#DC2626',
  inputBackground: '#FFFFFF',
  inputBorder: '#D8E0EA',
  shadow: 'rgba(21, 34, 56, 0.08)',
};

const darkColors: ThemeColors = {
  background: '#0B1426',
  surface: '#15243A',
  primary: '#45658C',
  secondary: '#9BB4D4',
  accent: '#E8CE96',
  onAccent: '#0B1426',
  text: '#F7F1E5',
  textSecondary: '#A7B5C9',
  border: '#2B3B54',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  inputBackground: '#15243A',
  inputBorder: '#2B3B54',
  shadow: 'rgba(0, 0, 0, 0.35)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('테마 로드 오류:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('테마 저장 오류:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors: theme === 'light' ? lightColors : darkColors }}>
      {children}
    </ThemeContext.Provider>
  );
};
