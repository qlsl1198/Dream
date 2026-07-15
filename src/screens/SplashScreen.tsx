import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { APP_CONFIG } from '../constants/AppConfig';

interface SplashScreenProps {
  onStart: () => void;
}

const { width } = Dimensions.get('window');

export default function SplashScreen({ onStart }: SplashScreenProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.85));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 48, friction: 7, useNativeDriver: true }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleStart = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 350, useNativeDriver: true }).start(onStart);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0B1426', '#162740', '#1F3352']} style={styles.gradient}>
        <View style={styles.stars}>
          {[...Array(12)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.star,
                {
                  top: `${(i * 47) % 80}%` as `${number}%`,
                  left: `${(i * 73) % 90}%` as `${number}%`,
                  opacity: 0.25 + (i % 5) * 0.1,
                },
              ]}
            />
          ))}
        </View>

        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.iconBackground}>
              <Ionicons name="moon" size={56} color="#E8D5A3" />
            </View>
          </Animated.View>

          <Text style={styles.appName}>{APP_CONFIG.name}</Text>
          <Text style={styles.appSubtitle}>{APP_CONFIG.tagline}</Text>
          <Text style={styles.description}>
            잠에서 깨어난 순간을 기록하고{'\n'}상징과 AI로 의미를 찾아보세요
          </Text>

          <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.85}>
            <Text style={styles.startButtonText}>시작하기</Text>
            <Ionicons name="arrow-forward" size={18} color="#0B1426" />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1426' },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  stars: { ...StyleSheet.absoluteFillObject },
  star: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#E8D5A3',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 36,
    width: Math.min(width, 420),
  },
  iconContainer: { marginBottom: 28 },
  iconBackground: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(232, 213, 163, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232, 213, 163, 0.4)',
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#F7F3EA',
    letterSpacing: 1,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#E8D5A3',
    fontWeight: '600',
    marginBottom: 20,
  },
  description: {
    fontSize: 15,
    color: 'rgba(247, 243, 234, 0.72)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#E8D5A3',
    borderRadius: 16,
    paddingHorizontal: 36,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  startButtonText: {
    color: '#0B1426',
    fontSize: 17,
    fontWeight: '800',
    marginRight: 6,
  },
});
