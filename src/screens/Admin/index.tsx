// @ts-ignore: If you see a type error here, make sure to install react-native-dotenv and configure babel
import { API_URL } from '@env';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { api, Subject } from '../../services/api';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AdminDashboard = () => {
  const navigation = useNavigation<NavigationProp>();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleLogout = async () => {
    try {
      // Delete session from database
      await api.sessions.logout();
      
      // Clear local storage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userData');
      
      console.log('Logged out successfully');
      
      // Navigate to login
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if server logout fails, clear local storage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userData');
      navigation.navigate('Login');
    }
  };

  const handleReturnToMain = () => {
    navigation.navigate('Home');
  };

  const loadSubjects = async () => {
    try {
      const data = await api.subjects.getAll();
      console.log('Fetched subjects:', JSON.stringify(data, null, 2));
      setSubjects(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل المواد');
    } finally {
      setLoading(false);
    }
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

  const renderSubjectImage = (subject: Subject) => {
    if (!subject.image) {
      console.log('No image for subject:', subject.name);
      return null;
    }

    const imageUrl = getImageUrl(subject.image);
    console.log('Rendering image for subject:', {
      subjectName: subject.name,
      imageUrl,
      imageName: subject.image
    });

    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.subjectImage}
          contentFit="cover"
          transition={1000}
          onLoad={() => console.log('Image loaded successfully:', subject.name)}
          onError={(error) => {
            console.error('Error loading image:', {
              subjectName: subject.name,
              imageUrl,
              error
            });
          }}
        />
      </View>
    );
  };

  const menuItems = [
    {
      title: 'إضافة مادة جديدة',
      icon: 'add-circle-outline',
      screen: 'AddSubject' as const,
    },
    {
      title: 'إضافة وحدة جديدة',
      icon: 'folder-outline',
      screen: 'AddUnit' as const,
    },
    {
      title: 'إضافة درس جديد',
      icon: 'videocam-outline',
      screen: 'AddLesson' as const,
    },
    {
      title: 'إضافة اختبار جديد',
      icon: 'document-text-outline',
      screen: 'AddQuiz' as const,
    },
    {
      title: 'إدارة الدروس',
      icon: 'list-outline',
      screen: 'ManageLessons' as const,
    },
    {
      title: 'إدارة الاختبارات',
      icon: 'checkbox-outline',
      screen: 'ManageQuizzes' as const,
    },
    {
      title: 'إدارة أكواد التفعيل',
      icon: 'key-outline',
      screen: 'ManageActivationCodes' as const,
    },
    {
      title: 'تسجيل الخروج',
      icon: 'log-out-outline',
      onPress: () => {
        Alert.alert(
          'تسجيل الخروج',
          'هل أنت متأكد من تسجيل الخروج؟',
          [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'تأكيد', onPress: handleLogout }
          ]
        );
      },
    },
  ];

  const handleMenuPress = (item: any) => {
    if (item.onPress) {
      item.onPress();
    } else if (item.screen) {
      navigation.navigate(item.screen as any);
    }
  };

  const handleSubjectPress = (subject: Subject) => {
    navigation.navigate('SubjectUnits', { subjectId: subject.id });
  };

  const handleEditPress = (subject: Subject) => {
    navigation.navigate('AddSubject', { subject });
  };

  const handleDeletePress = (subject: Subject) => {
    Alert.alert(
      'تأكيد الحذف',
      `هل أنت متأكد من حذف المادة "${subject.name}"؟`,
      [
        {
          text: 'إلغاء',
          style: 'cancel'
        },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.subjects.delete(subject.id);
              Alert.alert('نجاح', 'تم حذف المادة بنجاح');
              loadSubjects(); // تحديث القائمة
            } catch (error) {
              console.error('Error deleting subject:', error);
              Alert.alert('خطأ', 'حدث خطأ أثناء حذف المادة');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E31E24" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleReturnToMain}
          >
            <Ionicons name="home-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>لوحة التحكم</Text>
      </View>

      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item)}
          >
            <Ionicons name={item.icon as any} size={32} color="#E31E24" />
            <Text style={styles.menuItemText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.subjectsSection}>
        <Text style={styles.sectionTitle}>المواد الدراسية</Text>
        {subjects.map((subject) => (
          <View key={subject.id} style={styles.subjectCard}>
            <TouchableOpacity
              style={styles.subjectContent}
              onPress={() => handleSubjectPress(subject)}
            >
              {renderSubjectImage(subject)}
              <View style={styles.subjectInfo}>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <Text style={styles.subjectSection}>
                  {subject.section === 'scientific' && 'علمي'}
                  {subject.section === 'literary' && 'أدبي'}
                  {subject.section === 'intensive' && 'مكثف'}
                </Text>
                <Text style={styles.unitCount}>
                  {subject.units.length} وحدة
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={[styles.controlButton, styles.editButton]}
                onPress={() => handleEditPress(subject)}
              >
                <Ionicons name="pencil" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, styles.deleteButton]}
                onPress={() => handleDeletePress(subject)}
              >
                <Ionicons name="trash" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#E31E24',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  subjectsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  subjectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginRight: 15,
    backgroundColor: '#f0f0f0',
  },
  subjectImage: {
    width: '100%',
    height: '100%',
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subjectSection: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  unitCount: {
    fontSize: 14,
    color: '#666',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#E31E24',
  },
  headerButtons: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    zIndex: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default AdminDashboard; 