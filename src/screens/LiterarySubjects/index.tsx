// @ts-ignore: If you see a type error here, make sure to install react-native-dotenv and configure babel
import { API_URL } from '@env';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api, Subject } from '../../services/api';
import { getDeviceId } from '../../services/device';

const LiterarySubjects = ({ navigation }: any) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
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
      const response = await api.devices.getStatus(deviceId);
      
      if (response.isActive && response.section === 'literary') {
        setIsSubscribed(true);
        setSubscriptionExpiresAt(response.expiresAt);
        console.log('Device is subscribed to literary section until:', response.expiresAt);
      } else {
        setIsSubscribed(false);
        console.log('Device is not subscribed to literary section');
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setIsSubscribed(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await api.subjects.getBySection('literary');
      setSubjects(data);
      if (!data || data.length === 0) {
        Alert.alert('أوفلاين', 'لا توجد بيانات متاحة أوفلاين. يرجى الاتصال بالإنترنت أول مرة.');
      }
    } catch (error) {
      // حاول جلب البيانات من الكاش مباشرة (احتياطي)
      const cached = await AsyncStorage.getItem('subjects_section_literary');
      if (cached) {
        setSubjects(JSON.parse(cached));
        Alert.alert('أوفلاين', 'تم عرض البيانات المخزنة مؤقتًا.');
      } else {
        setSubjects([]);
        Alert.alert('أوفلاين', 'لا توجد بيانات متاحة أوفلاين. يرجى الاتصال بالإنترنت أول مرة.');
      }
    }
  };

  // Helper to check if subject has any free lesson
  const hasFreeLesson = (subject: Subject) =>
    subject.units.some(unit => unit.lessons && unit.lessons.some(lesson => lesson.isFree));

  // Helper to get the icon for the subject
  const getSubjectIcon = (subject: Subject) => {
    if (hasFreeLesson(subject)) {
      return { name: 'checkmark-circle', color: '#2ecc40' };
    }
    // إذا لم يكن هناك درس مجاني، نعرض قفل ولكن نسمح بالتنقل للاستكشاف
    return { name: 'lock-closed', color: '#F44336' };
  };

  const handleVideoPress = (subject: Subject) => {
    // السماح بالدخول لجميع المواد للاستكشاف
    navigation.navigate('SubjectUnitsView', {
      subjectId: subject.id,
      viewType: 'videos',
    });
  };

  const handleQuizPress = (subject: Subject) => {
    // السماح بالدخول لجميع المواد للاستكشاف
    navigation.navigate('SubjectUnitsView', {
      subjectId: subject.id,
      viewType: 'quizzes',
    });
  };

  const handleSubjectPress = (subject: Subject) => {
    // السماح بالدخول لجميع المواد للاستكشاف
    navigation.navigate('SubjectUnitsView', {
      subjectId: subject.id,
    });
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
        <Text style={styles.navbarTitle}>القسم الأدبي</Text>
        <View style={{ width: 32 }} />
      </View>
      <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
        <ScrollView style={styles.content}>
          <View style={styles.subjectsList}>
            {subjects.map((subject) => (
              <View key={subject.id} style={styles.subjectCardRow}>
                <View style={styles.subjectCard}>
                  <View style={styles.subjectCardLeft}>
                    <Ionicons 
                      name={getSubjectIcon(subject).name as any} 
                      size={28} 
                      color={getSubjectIcon(subject).color} 
                      style={styles.checkIcon} 
                    />
                    <View style={styles.imageCircleShadow}>{renderSubjectImage(subject)}</View>
                  </View>
                  <View style={styles.subjectCardCenter}>
                    <Text style={styles.subjectName}>{subject.name}</Text>
                  </View>
                  <View style={styles.subjectCardRight}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleVideoPress(subject)}>
                      <Ionicons name="videocam" size={28} color="#fff" style={styles.videoIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconButton, styles.testButton]} onPress={() => handleQuizPress(subject)}>
                      <Ionicons name="reader" size={28} color="#fff" style={styles.testIcon} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
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

export default LiterarySubjects; 