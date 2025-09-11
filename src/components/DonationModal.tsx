import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Linking,
  Alert,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

// 플랫폼별 이미지 처리
const tossQR = Platform.OS === 'web' 
  ? { uri: '/images/toss.JPG' }
  : require('../../assets/toss.png');

const kakaoQR = Platform.OS === 'web'
  ? { uri: '/images/kakao.JPG' }
  : require('../../assets/kakao 2.jpg');

interface DonationModalProps {
  visible: boolean;
  onClose: () => void;
}

const DonationModal: React.FC<DonationModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();

  const donationMethods = [
    {
      id: 'toss',
      name: '토스',
      description: 'QR 코드로 간편 후원',
      icon: 'card-outline',
      color: '#0064FF',
      //qrImage: { uri: 'file:///Users/kimsubin/Desktop/Projects/PersonalProjects/DreamInterpreterApp/assets/toss.JPG' },
      qrImage: tossQR,
      resizeMode: 'center' as any,
      action: () => handleDonation('toss'),
    },
    {
      id: 'kakao',
      name: '카카오페이',
      description: 'QR 코드로 간편 후원',
      icon: 'chatbubble-outline',
      color: '#FFEB00',
      //qrImage: { uri: 'file:///Users/kimsubin/Desktop/Projects/PersonalProjects/DreamInterpreterApp/assets/kakao.JPG' },
      qrImage: kakaoQR,
      resizeMode: 'top' as any,
      action: () => handleDonation('kakao'),
    },
  ];

  const handleDonation = (method: string) => {
    switch (method) {
      case 'toss':
        Alert.alert(
          '토스 후원',
          '토스 앱에서 QR 코드를 스캔하여 후원해주세요.',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '토스 앱 열기',
              onPress: () => {
                Linking.openURL('supertoss://').catch(() => {
                  Alert.alert('알림', '토스 앱이 설치되어 있지 않습니다.');
                });
              },
            },
          ]
        );
        break;
      case 'kakao':
        Alert.alert(
          '카카오페이 후원',
          '카카오페이 앱에서 QR 코드를 스캔하여 후원해주세요.',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '카카오페이 앱 열기',
              onPress: () => {
                Linking.openURL('kakaotalk://').catch(() => {
                  Alert.alert('알림', '카카오톡 앱이 설치되어 있지 않습니다.');
                });
              },
            },
          ]
        );
        break;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>개발자에게 후원</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.introSection}>
            <Ionicons name="heart" size={48} color="#FF6B6B" />
            <Text style={[styles.introTitle, { color: colors.text }]}>
              개발자를 응원해주세요
            </Text>
            <Text style={[styles.introText, { color: colors.textSecondary }]}>
              더 나은 앱을 만들기 위한 개발자에게 따뜻한 후원을 보내주세요.
            </Text>
          </View>

          <View style={styles.donationSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              후원 방법
            </Text>
            
            {donationMethods.map((method) => (
              <View key={method.id}>
                <TouchableOpacity
                  style={[styles.donationItem, {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }]}
                  onPress={method.action}
                  activeOpacity={0.7}
                >
                  <View style={styles.donationContent}>
                    <View style={[styles.iconContainer, { backgroundColor: method.color }]}>
                      <Ionicons name={method.icon as any} size={24} color="#fff" />
                    </View>
                    <View style={styles.donationInfo}>
                      <Text style={[styles.donationName, { color: colors.text }]}>
                        {method.name}
                      </Text>
                      <Text style={[styles.donationDescription, { color: colors.textSecondary }]}>
                        {method.description}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                
                {/* QR 코드 이미지 */}
                <View style={[styles.qrContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.qrTitle, { color: colors.text }]}>
                    {method.name} QR 코드
                  </Text>
                  <Image 
                    source={method.qrImage} 
                    style={styles.qrImage}
                    resizeMode={method.resizeMode}
                    loadingIndicatorSource={require('../../assets/icon.png')}
                    fadeDuration={200}
                  />
                  <Text style={[styles.qrDescription, { color: colors.textSecondary }]}>
                    {method.name} 앱에서 QR 코드를 스캔하여 후원해주세요
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.messageSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.messageTitle, { color: colors.text }]}>
              💌 개발자에게 메시지
            </Text>
            <Text style={[styles.messageText, { color: colors.textSecondary }]}>
              후원과 함께 따뜻한 메시지도 보내주세요. 개발자에게 큰 힘이 됩니다!
            </Text>
            <TouchableOpacity
              style={[styles.messageButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                Alert.alert(
                  '메시지 전송',
                  '후원 시 메시지를 함께 전달하시겠습니까?',
                  [
                    { text: '취소', style: 'cancel' },
                    { text: '확인', onPress: () => {} },
                  ]
                );
              }}
            >
              <Ionicons name="mail" size={16} color="#fff" />
              <Text style={styles.messageButtonText}>메시지 작성</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.thanksSection, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <Text style={[styles.thanksTitle, { color: colors.text }]}>
              🙏 감사합니다
            </Text>
            <Text style={[styles.thanksText, { color: colors.textSecondary }]}>
              여러분의 후원이 더 나은 앱 개발의 원동력이 됩니다.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  introSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  donationSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  donationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  donationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  donationInfo: {
    flex: 1,
  },
  donationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  donationDescription: {
    fontSize: 14,
  },
  qrContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  qrImage: {
    width: 180,
    height: 180,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  qrDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  messageSection: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  thanksSection: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  thanksTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  thanksText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default DonationModal;
