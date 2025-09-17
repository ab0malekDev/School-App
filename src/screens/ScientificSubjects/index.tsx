// @ts-ignore: If you see a type error here, make sure to install react-native-dotenv and configure babel
import { API_URL } from '@env';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Drawer from '../../components/common/Drawer';
import AboutModal from '../../components/modals/AboutModal';
import ContactModal from '../../components/modals/ContactModal';
import PolicyModal from '../../components/modals/PolicyModal';
import { api, Subject } from '../../services/api';
import { getDeviceId } from '../../services/device';

const ScientificSubjects = ({ navigation }: any) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isContactModalVisible, setContactModalVisible] = useState(false);
  const [isPolicyModalVisible, setPolicyModalVisible] = useState(false);
  const [isAboutModalVisible, setAboutModalVisible] = useState(false);
  const [isDrawerVisible, setDrawerVisible] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkSubscriptionStatus();
    fetchSubjects();
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const deviceId = await getDeviceId();
      const response = await api.devices.activate(deviceId, ''); // This will check status
      
      if (response.isActive && response.section === 'scientific') {
        setIsSubscribed(true);
        setSubscriptionExpiresAt(response.expiresAt);
        console.log('Device is subscribed to scientific section until:', response.expiresAt);
      } else {
        setIsSubscribed(false);
        console.log('Device is not subscribed to scientific section');
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setIsSubscribed(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await api.subjects.getBySection('scientific');
      console.log('Fetched subjects:', JSON.stringify(data, null, 2));
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleMenuPress = () => {
    setDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
  };

  const handleContactPress = () => {
    setContactModalVisible(true);
  };

  const handlePolicyPress = () => {
    setPolicyModalVisible(true);
  };

  const handleAboutPress = () => {
    setAboutModalVisible(true);
  };

  const handleVideoPress = (subject: Subject) => {
    if (!subject || !subject.id) {
      console.error('Invalid subject:', subject);
      Alert.alert('خطأ', 'بيانات المادة غير صالحة');
      return;
    }
    console.log('Navigating to SubjectUnitsView for videos with subject:', subject);
    navigation.navigate('SubjectUnitsView', { 
      subjectId: subject.id,
      viewType: 'videos'
    });
  };

  const handleQuizPress = (subject: Subject) => {
    if (!subject || !subject.id) {
      console.error('Invalid subject:', subject);
      Alert.alert('خطأ', 'بيانات المادة غير صالحة');
      return;
    }
    console.log('Navigating to SubjectUnitsView for quizzes with subject:', subject);
    navigation.navigate('SubjectUnitsView', { 
      subjectId: subject.id,
      viewType: 'quizzes'
    });
  };

  const handleSubjectPress = (subject: Subject) => {
    if (!subject || !subject.id) {
      console.error('Invalid subject:', subject);
      Alert.alert('خطأ', 'بيانات المادة غير صالحة');
      return;
    }
    console.log('Navigating to SubjectUnitsView with subject:', subject);
    navigation.navigate('SubjectUnitsView', { 
      subjectId: subject.id,
      viewType: undefined
    });
  };

  const handleCloseContactModal = () => {
    setContactModalVisible(false);
  };

  const handleClosePolicyModal = () => {
    setPolicyModalVisible(false);
  };

  const handleCloseAboutModal = () => {
    setAboutModalVisible(false);
  };

  const getImageUrl = (imageName: string) => {
    const url = `${API_URL}/uploads/subjects/${imageName}`;
    console.log('Building image URL:', {
      imageName,
      fullUrl: url,
      exists: !!imageName
    });
    return url;
  };

  const renderSubjectImage = (subject: Subject) => (
    <Image
      source={subject.image ? { uri: `${API_URL}/uploads/subjects/${subject.image}` } : require('../../assets/logo.png')}
      style={styles.subjectImage}
      contentFit="cover"
      transition={1000}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navbarTitle}>بكالوريا</Text>
        <View style={{ width: 32 }} />
      </View>
      <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
        <ScrollView style={styles.content}>
          <View style={styles.subjectsList}>
            {subjects.map((subject) => (
              <View key={subject.id} style={styles.subjectCardRow}>
                <TouchableOpacity onPress={() => handleSubjectPress(subject)} style={styles.subjectCard} activeOpacity={0.8}>
                  <View style={styles.subjectCardLeft}>
                    <Ionicons 
                      name={subject.units.some(unit => unit.lessons && unit.lessons.length > 0) ? "checkmark-circle" : "lock-closed"} 
                      size={28} 
                      color={subject.units.some(unit => unit.lessons && unit.lessons.length > 0) ? "#2ecc40" : "#ff6b6b"} 
                      style={styles.checkIcon} 
                    />
                    <View style={styles.imageCircleShadow}>
                      {renderSubjectImage(subject)}
                    </View>
                  </View>
                  <View style={styles.subjectCardCenter}>
                    <Text style={styles.subjectName}>{subject.name}</Text>
                  </View>
                  <View style={styles.subjectCardRight}>
                    <TouchableOpacity 
                      style={styles.iconButton} 
                      onPress={() => handleVideoPress(subject)}
                    >
                      <Ionicons name="videocam" size={28} color="#fff" style={styles.videoIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.iconButton, styles.testButton]} 
                      onPress={() => handleQuizPress(subject)}
                    >
                      <Ionicons name="reader" size={28} color="#fff" style={styles.testIcon} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
      <ContactModal
        isVisible={isContactModalVisible}
        onClose={handleCloseContactModal}
      />
      <PolicyModal
        isVisible={isPolicyModalVisible}
        onClose={handleClosePolicyModal}
      />
      <AboutModal
        isVisible={isAboutModalVisible}
        onClose={handleCloseAboutModal}
      />
      <Drawer
        isVisible={isDrawerVisible}
        onClose={handleDrawerClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E31E24',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  navbarTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  subjectsList: {
    padding: 10,
  },
  subjectCardRow: {
    marginBottom: 16,
    alignItems: 'center',
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '98%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  subjectCardLeft: {
    alignItems: 'center',
    marginRight: 12,
  },
  checkIcon: {
    marginBottom: 4,
  },
  imageCircleShadow: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  subjectImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    resizeMode: 'cover',
  },
  subjectCardCenter: {
    flex: 1,
    alignItems: 'center',
  },
  subjectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  subjectCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  iconButton: {
    backgroundColor: '#E31E24',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 2,
  },
  testButton: {
    backgroundColor: '#FFD600',
  },
  videoIcon: {},
  testIcon: {},
  menuButton: {
    padding: 5,
  },
});

export default ScientificSubjects; 