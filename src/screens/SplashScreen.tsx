import React, { useState, useEffect } from 'react';
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

interface SplashScreenProps {
  onStart: () => void;
}

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onStart }: SplashScreenProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [slideAnim] = useState(new Animated.Value(50));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // 초기 애니메이션
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    // 펄스 애니메이션
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  const handleStart = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onStart();
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          {/* 앱 아이콘 */}
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <View style={styles.iconBackground}>
              <Ionicons name="moon" size={60} color="#fff" />
            </View>
          </Animated.View>

          {/* 앱 제목 */}
          <View style={styles.titleContainer}>
            <Text style={styles.appName}>Dream Interpreter</Text>
            <Text style={styles.appSubtitle}>꿈 해석 & 기억 복원</Text>
          </View>

          {/* 설명 텍스트 */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              AI가 당신의 꿈을 해석하고{'\n'}
              잊혀진 기억을 복원해드립니다
            </Text>
          </View>

          {/* 시작 버튼 */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ff6b6b', '#ee5a24']}
              style={styles.startButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="play" size={24} color="#fff" />
              <Text style={styles.startButtonText}>시작하기</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* 하단 정보 */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              터치하여 꿈의 세계로 떠나보세요
            </Text>
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <Ionicons name="moon-outline" size={16} color="#fff" />
                <Text style={styles.featureText}>꿈 해석</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="search-outline" size={16} color="#fff" />
                <Text style={styles.featureText}>기억 복원</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="time-outline" size={16} color="#fff" />
                <Text style={styles.featureText}>기록 관리</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    width: '100%',
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: 50,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  startButton: {
    marginBottom: 60,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footerContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    fontWeight: '500',
  },
});
